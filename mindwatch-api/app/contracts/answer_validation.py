ALLOWED_ANSWER_KEYS: frozenset[str] = frozenset({
    "not_at_all",
    "sometimes",
    "often",
    "almost_always",
})


def validate_answer(answer_key: str) -> bool:
    return answer_key in ALLOWED_ANSWER_KEYS
