"""Subreddit name validation."""

from .constants import SUBREDDIT_PATTERN


def validate_subreddit(subreddit: str) -> str:
    """
    Validate and sanitize subreddit name.

    Args:
        subreddit: Raw subreddit name input.

    Returns:
        Sanitized subreddit name.

    Raises:
        ValueError: If subreddit name is invalid.
    """
    if not subreddit:
        raise ValueError("Subreddit name cannot be empty")

    # Strip whitespace and remove r/ prefix if present
    cleaned = subreddit.strip()
    if cleaned.lower().startswith("r/"):
        cleaned = cleaned[2:]

    if not SUBREDDIT_PATTERN.match(cleaned):
        raise ValueError(
            f"Invalid subreddit name '{subreddit}': must be 3-21 characters, "
            "alphanumeric and underscores only, cannot start with underscore"
        )

    return cleaned
