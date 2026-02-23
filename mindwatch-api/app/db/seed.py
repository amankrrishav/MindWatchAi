"""
Clinical-standard seed data for human questions and answer mapping.
PHQ-9 aligned. Idempotent: only seeds if tables are empty.
"""
from sqlalchemy.orm import Session

from app.db.models import HumanQuestion, AnswerPHQMapping
from app.db.session import SessionLocal

# PHQ-9 aligned questions. clinical_key maps to PHQ domain.
QUESTIONS = [
    {
        "id": "q_anhedonia",
        "clinical_key": "anhedonia",
        "question_text": "Over the last 2 weeks, how often have you had little interest or pleasure in doing things?",
        "risk_level": "low",
    },
    {
        "id": "q_mood",
        "clinical_key": "mood",
        "question_text": "Over the last 2 weeks, how often have you been feeling down, depressed, or hopeless?",
        "risk_level": "low",
    },
    {
        "id": "q_sleep",
        "clinical_key": "sleep",
        "question_text": "Over the last 2 weeks, how often have you had trouble falling or staying asleep, or sleeping too much?",
        "risk_level": "low",
    },
    {
        "id": "q_energy",
        "clinical_key": "energy",
        "question_text": "Over the last 2 weeks, how often have you been feeling tired or having little energy?",
        "risk_level": "low",
    },
    {
        "id": "q_appetite",
        "clinical_key": "appetite",
        "question_text": "Over the last 2 weeks, how often have you had poor appetite or been overeating?",
        "risk_level": "medium",
    },
    {
        "id": "q_self_worth",
        "clinical_key": "self_worth",
        "question_text": "Over the last 2 weeks, how often have you felt bad about yourself—or that you are a failure or have let yourself or your family down?",
        "risk_level": "medium",
    },
    {
        "id": "q_concentration",
        "clinical_key": "concentration",
        "question_text": "Over the last 2 weeks, how often have you had trouble concentrating on things, such as reading the newspaper or watching television?",
        "risk_level": "medium",
    },
    {
        "id": "q_movement",
        "clinical_key": "movement",
        "question_text": "Over the last 2 weeks, how often have you been moving or speaking so slowly that other people could have noticed? Or the opposite—being so fidgety or restless that you have been moving around a lot more than usual?",
        "risk_level": "high",
    },
    {
        "id": "q_suicidal",
        "clinical_key": "suicidal",
        "question_text": "Over the last 2 weeks, how often have you had thoughts that you would be better off dead, or of hurting yourself in some way?",
        "risk_level": "high",
    },
]

# Standard PHQ-9 answer scale: 0-3 per item
# clinical_key + answer_key -> phq_score (0-3)
ANSWER_MAPPINGS = []
for q in QUESTIONS:
    ck = q["clinical_key"]
    for key, score in [
        ("not_at_all", 0),
        ("sometimes", 1),
        ("often", 2),
        ("almost_always", 3),
    ]:
        ANSWER_MAPPINGS.append({"clinical_key": ck, "answer_key": key, "phq_score": score})


def seed_if_empty(db: Session) -> None:
    if db.query(HumanQuestion).count() > 0:
        return
    for q in QUESTIONS:
        db.add(HumanQuestion(**q))
    db.commit()

    if db.query(AnswerPHQMapping).count() > 0:
        return
    for m in ANSWER_MAPPINGS:
        db.add(AnswerPHQMapping(**m))
    db.commit()


def run_seed() -> None:
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
