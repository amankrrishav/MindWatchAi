from datetime import timedelta

ANSWER_COOLDOWN = timedelta(hours=12)
SKIP_COOLDOWN = timedelta(hours=24)
MAX_QUESTIONS_PER_DAY = 3
MAX_SKIPS_PER_DAY = 2
MIN_GAP_BETWEEN_QUESTIONS = timedelta(hours=6)
