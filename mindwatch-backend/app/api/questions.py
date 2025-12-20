from fastapi import APIRouter, Depends, Response, status, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.contracts.question_card import build_question_card
from app.orchestration.question_selector import select_questions
from app.contracts.answer_validation import validate_answer

from app.db.models import (
    OrchestrationDecision,
    HumanQuestion,
    HumanAnswer,
    AnswerPHQMapping,
    PHQ9Label,
)

router = APIRouter(prefix="/api/questions", tags=["questions"])


# -------------------------------
# TEMP USER STUB
# -------------------------------
def get_current_user_id():
    """
    TEMPORARY stub.
    Will be replaced with real auth later.
    """
    return "test-user-uuid"


# -------------------------------
# REQUEST SCHEMA
# -------------------------------
class AnswerPayload(BaseModel):
    answer_key: str


# -------------------------------
# GET NEXT QUESTION
# -------------------------------
@router.get("/next")
def get_next_question(db: Session = Depends(get_db)):
    user_id = get_current_user_id()

    decision = (
        db.query(OrchestrationDecision)
        .filter_by(user_id=user_id)
        .order_by(OrchestrationDecision.created_at.desc())
        .first()
    )

    # Stay silent if no decision or dont_ask
    if not decision or decision.decision != "ask":
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    questions = (
        db.query(HumanQuestion)
        .filter_by(active=True)
        .all()
    )

    question_dicts = [
        {
            "id": q.id,
            "clinical_key": q.clinical_key,
            "question_text": q.question_text,
            "risk_level": q.risk_level,
        }
        for q in questions
    ]

    selected = select_questions(
        decision="ask",
        uncertainty_reason=decision.uncertainty_reason,
        questions=question_dicts,
    )

    if not selected:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    q = selected[0]

    return build_question_card(
        question_id=q["id"],
        question_text=q["question_text"],
    )


# -------------------------------
# SUBMIT ANSWER
# -------------------------------
@router.post("/{question_id}/answer", status_code=status.HTTP_204_NO_CONTENT)
def submit_answer(
    question_id: str,
    payload: AnswerPayload,
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id()

    if not validate_answer(payload.answer_key):
        raise HTTPException(status_code=400, detail="Invalid answer")

    # Ensure question exists
    question = (
        db.query(HumanQuestion)
        .filter_by(id=question_id, active=True)
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Store human answer
    answer = HumanAnswer(
        user_id=user_id,
        question_id=question_id,
        answer_key=payload.answer_key,
    )
    db.add(answer)

    # Map to PHQ score (Phase 15.3)
    mapping = (
        db.query(AnswerPHQMapping)
        .filter_by(
            clinical_key=question.clinical_key,
            answer_key=payload.answer_key,
        )
        .first()
    )

    if mapping:
        db.add(
            PHQ9Label(
                user_id=user_id,
                score=mapping.phq_score,
            )
        )

    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)

from fastapi import HTTPException

@router.post("/{question_id}/skip", status_code=204)
def skip_question(
    question_id: str,
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id()

    # Ensure question exists and is active
    question = (
        db.query(HumanQuestion)
        .filter_by(id=question_id, active=True)
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Prevent answering/skipping the same question twice
    existing = (
        db.query(HumanAnswer)
        .filter_by(user_id=user_id, question_id=question_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Question already handled",
        )

    # Record skip as a human answer
    skip_entry = HumanAnswer(
        user_id=user_id,
        question_id=question_id,
        answer_key="skipped",
    )

    db.add(skip_entry)
    db.commit()