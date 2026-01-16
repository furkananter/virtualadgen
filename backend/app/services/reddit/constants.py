"""Reddit service constants and configuration."""

import re

# Reddit API configuration
REDDIT_BASE_URL = "https://www.reddit.com"
SUBREDDIT_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_]{2,20}$")

# Fallback data when Reddit blocks us or validation fails
FALLBACK_DATA = {
    "posts": [],
    "trends": ["trending", "viral", "aesthetic", "premium", "luxury"],
    "top_post": "Latest trending styles and innovations",
    "keywords": ["modern", "aesthetic", "quality", "premium"],
    "community_vibe": "quality-focused enthusiasts",
    "fallback": True,
}

# Patterns to filter out noise posts (mod threads, daily questions, etc.)
NOISE_PATTERNS = [
    r"^\[.*?\]",  # [MOD], [MEGATHREAD], etc.
    r"^(daily|weekly|monthly)\s+(thread|discussion|question)",
    r"^(ask|ama|iama)\s+",
    r"^(meta|rule|announcement)",
    r"r/\w+\s+(shopping|help|desk|question|megathread)",
]

# Common words to filter out from keyword extraction
STOP_WORDS = frozenset(
    {
        # Articles & conjunctions
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        # Prepositions
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
        "from",
        # Be verbs
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        # Have verbs
        "have",
        "has",
        "had",
        # Do verbs
        "do",
        "does",
        "did",
        # Modal verbs
        "will",
        "would",
        "could",
        "should",
        "may",
        "might",
        "must",
        "shall",
        "can",
        "need",
        # Demonstratives
        "this",
        "that",
        "these",
        "those",
        # Pronouns
        "i",
        "you",
        "he",
        "she",
        "it",
        "we",
        "they",
        "what",
        "which",
        "who",
        "whom",
        "when",
        "where",
        "why",
        "how",
        "them",
        "their",
        "your",
        # Quantifiers
        "all",
        "each",
        "every",
        "both",
        "few",
        "more",
        "most",
        "other",
        "some",
        # Misc common
        "such",
        "no",
        "not",
        "only",
        "own",
        "same",
        "so",
        "than",
        "too",
        "very",
        "just",
        "also",
        "now",
        "here",
        "there",
        "about",
        "after",
        "before",
        # Reddit-specific noise
        "mod",
        "thread",
        "daily",
        "weekly",
        "question",
        "ask",
        "anyone",
        "any",
        "got",
        "get",
        "getting",
        "new",
        "first",
        "one",
        "two",
        "like",
        "want",
        "looking",
        "help",
        "need",
        "best",
        "good",
        "bad",
        "make",
        "made",
        "into",
        "stuff",
        "really",
        "think",
        "know",
    }
)

# Keyword patterns to community vibe descriptions
VIBE_MAPPINGS = {
    ("espresso", "coffee", "brewing", "roast"): "specialty coffee enthusiasts",
    ("mechanical", "keyboard", "switches", "keycaps"): "tech-savvy customization fans",
    ("skincare", "routine", "products", "skin"): "beauty and self-care focused",
    ("fashion", "style", "outfit", "wear"): "style-conscious trendsetters",
    ("gaming", "setup", "rgb", "pc"): "gaming and tech enthusiasts",
    ("fragrance", "perfume", "scent", "cologne"): "fragrance connoisseurs",
    ("headphones", "audio", "sound", "music"): "audiophile community",
    ("makeup", "beauty", "cosmetics", "look"): "makeup and beauty lovers",
}
