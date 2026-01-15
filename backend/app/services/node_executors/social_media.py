"""Social media node executor."""

from typing import Any

from .base import BaseNodeExecutor
from app.services.reddit import fetch_subreddit_posts


class SocialMediaExecutor(BaseNodeExecutor):
    """
    Executor for SOCIAL_MEDIA nodes.

    Fetches data from social media platforms (currently Reddit).
    """

    async def execute(
        self,
        inputs: dict[str, Any],
        config: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Execute social media node.

        Args:
            inputs: Not used for this node type.
            config: Must contain platform-specific configuration.
            context: Optional execution context.

        Returns:
            Dictionary with 'posts' and 'trends' keys.
        """
        platform = config.get("platform", "reddit")

        if platform == "reddit":
            return await self._fetch_reddit_data(config)

        raise ValueError(f"Unsupported platform: {platform}")

    async def _fetch_reddit_data(self, config: dict[str, Any]) -> dict[str, Any]:
        """
        Fetch data from Reddit.

        Args:
            config: Configuration with subreddit, sort, and limit.

        Returns:
            Reddit posts and trends.
        """
        subreddit = config.get("subreddit", "all")
        sort = config.get("sort", "hot")
        limit = config.get("limit", 10)

        result = await fetch_subreddit_posts(subreddit, sort, limit)
        return {
            "posts": result["posts"],
            "trends": result["trends"],
        }

    def validate_config(self, config: dict[str, Any]) -> bool:
        """
        Validate social media configuration.

        Args:
            config: Node configuration.

        Returns:
            True if required platform config exists.
        """
        platform = config.get("platform", "reddit")
        if platform == "reddit":
            return "subreddit" in config
        return False
