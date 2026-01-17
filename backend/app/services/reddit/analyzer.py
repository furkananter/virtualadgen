"""Reddit post analysis and insight extraction."""

import re

from .constants import FALLBACK_DATA, NOISE_PATTERNS, STOP_WORDS, VIBE_MAPPINGS


def extract_insights(
    posts: list[dict[str, object]], subreddit: str
) -> dict[str, object]:
    """
    Extract meaningful insights from Reddit posts.

    Args:
        posts: List of post dictionaries.
        subreddit: Subreddit name for context.

    Returns:
        Rich insights dictionary.
    """
    if not posts:
        return dict(FALLBACK_DATA)

    # Filter out noise posts (mod threads, daily questions, etc.)
    quality_posts = _filter_quality_posts(posts)

    # Get top post by engagement (score + comments)
    top_post = _get_top_post(quality_posts or posts)

    # Extract meaningful keywords
    keywords = _extract_keywords(quality_posts or posts)

    # Generate community vibe description
    community_vibe = _analyze_community_vibe(keywords, subreddit)

    # Legacy trends field for backward compatibility
    trends = keywords[:6] if keywords else list(FALLBACK_DATA["trends"])

    return {
        "posts": posts,
        "top_post": top_post,
        "keywords": keywords,
        "trends": trends,
        "community_vibe": community_vibe,
        "fallback": False,
    }


def _filter_quality_posts(posts: list[dict[str, object]]) -> list[dict[str, object]]:
    """Filter out mod threads, daily questions, and other noise."""
    quality = []
    for post in posts:
        title = str(post.get("title", "")).lower()
        is_noise = any(re.search(pattern, title, re.I) for pattern in NOISE_PATTERNS)
        score = post.get("score", 0)
        if not is_noise and isinstance(score, (int, float)) and score > 0:
            quality.append(post)
    return quality


def _safe_float(value: object, default: float = 0.0) -> float:
    """Safely convert a value to float."""
    if isinstance(value, (int, float)):
        return float(value)
    return default


def _get_top_post(posts: list[dict[str, object]]) -> str:
    """Get the most engaging post title, preferring positive content."""
    if not posts:
        return str(FALLBACK_DATA["top_post"])

    def quality_score(p: dict[str, object]) -> float:
        score = _safe_float(p.get("score", 0))
        comments = _safe_float(p.get("num_comments", 0))
        # Penalize posts with low score but high comments (controversial)
        if score < 50 and comments > 50:
            return score * 0.5
        return score + (comments * 0.3)

    sorted_posts = sorted(posts, key=quality_score, reverse=True)
    top_title = str(sorted_posts[0].get("title", ""))

    # Clean up the title
    cleaned = re.sub(r"^\[.*?\]\s*", "", top_title)  # Remove [tags]
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    return cleaned if cleaned else str(FALLBACK_DATA["top_post"])


def _extract_keywords(
    posts: list[dict[str, object]], max_keywords: int = 8
) -> list[str]:
    """Extract meaningful keywords from post titles."""
    word_scores: dict[str, float] = {}

    for post in posts:
        title = str(post.get("title", ""))
        raw_score = post.get("score", 1)
        score = _safe_float(raw_score, 1.0)

        # Clean title
        title = re.sub(r"^\[.*?\]\s*", "", title)  # Remove [tags]
        title = re.sub(r"[^\w\s-]", " ", title)  # Keep words and hyphens

        words = title.lower().split()

        for word in words:
            cleaned = word.strip("-")
            if (
                cleaned
                and len(cleaned) > 2
                and cleaned not in STOP_WORDS
                and not cleaned.isdigit()
            ):
                # Weight by post score
                word_scores[cleaned] = word_scores.get(cleaned, 0) + (1 + score * 0.1)

    # Sort by score and return top keywords
    sorted_words = sorted(word_scores.items(), key=lambda x: x[1], reverse=True)
    return [word for word, _ in sorted_words[:max_keywords]]


def _analyze_community_vibe(keywords: list[str], subreddit: str) -> str:
    """Generate a brief community vibe description."""
    if not keywords:
        return "engaged community"

    keyword_set = set(keywords[:5])

    for pattern_words, vibe in VIBE_MAPPINGS.items():
        if keyword_set & set(pattern_words):
            return str(vibe)

    # Default: use top keywords
    top_3 = keywords[:3]
    if top_3:
        return f"{', '.join(top_3)} enthusiasts"

    return "engaged community"
