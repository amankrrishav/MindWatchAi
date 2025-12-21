from fastapi import APIRouter, Depends, Response, status, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

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
    QuestionGuardrailState,
)

from app.guardrails.evaluator import guardrails_blocked
from app.guardrails.constants import ANSWER_COOLDOWN, SKIP_COOLDOWN
from app.auth.context import get_current_user_id


router = APIRouter(prefix="/api/questions", tags=["questions"])


# -------------------------------
# REQUEST SCHEMA
# -------------------------------
class AnswerPayload(BaseModel):
    answer_key: str


# -------------------------------
# GET NEXT QUESTION
# -------------------------------
@router.get("/next")
def get_next_question(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    # Load guardrail state
    state = db.get(QuestionGuardrailState, user_id)

    # Silent guardrail block
    if state and guardrails_blocked(state):
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    decision = (
        db.query(OrchestrationDecision)
        .filter_by(user_id=user_id)
        .order_by(OrchestrationDecision.created_at.desc())
        .first()
    )

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

    # Ensure guardrail state exists
    if not state:
        state = QuestionGuardrailState(
            user_id=user_id,
            questions_today=0,
            skips_today=0,
        )
        db.add(state)

    if state.questions_today is None:
        state.questions_today = 0

    state.last_question_at = datetime.utcnow()
    state.questions_today += 1
    state.updated_at = datetime.utcnow()

    db.commit()

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
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if not validate_answer(payload.answer_key):
        raise HTTPException(status_code=400, detail="Invalid answer")

    question = (
        db.query(HumanQuestion)
        .filter_by(id=question_id, active=True)
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    existing = (
        db.query(HumanAnswer)
        .filter_by(user_id=user_id, question_id=question_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Question already handled")

    answer = HumanAnswer(
        user_id=user_id,
        question_id=question_id,
        answer_key=payload.answer_key,
    )
    db.add(answer)

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

    # Guardrail update
    state = db.get(QuestionGuardrailState, user_id)
    if not state:
        state = QuestionGuardrailState(
            user_id=user_id,
            questions_today=0,
            skips_today=0,
        )
        db.add(state)

    state.last_answer_at = datetime.utcnow()
    state.cooldown_until = state.last_answer_at + ANSWER_COOLDOWN
    state.updated_at = datetime.utcnow()

    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# -------------------------------
# SKIP QUESTION
# -------------------------------
@router.post("/{question_id}/skip", status_code=status.HTTP_204_NO_CONTENT)
def skip_question(
    question_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    question = (
        db.query(HumanQuestion)
        .filter_by(id=question_id, active=True)
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    existing = (
        db.query(HumanAnswer)
        .filter_by(user_id=user_id, question_id=question_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Question already handled")

    skip_entry = HumanAnswer(
        user_id=user_id,
        question_id=question_id,
        answer_key="skipped",
    )
    db.add(skip_entry)

    # Guardrail update
    state = db.get(QuestionGuardrailState, user_id)
    if not state:
        state = QuestionGuardrailState(
            user_id=user_id,
            questions_today=0,
            skips_today=0,
        )
        db.add(state)

    if state.skips_today is None:
        state.skips_today = 0

    state.last_skip_at = datetime.utcnow()
    state.skips_today += 1
    state.cooldown_until = state.last_skip_at + SKIP_COOLDOWN
    state.updated_at = datetime.utcnow()

    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)