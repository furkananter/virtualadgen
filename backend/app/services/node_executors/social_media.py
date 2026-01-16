"""Social media node executor."""

from .base import BaseNodeExecutor
from app.services.reddit import fetch_subreddit_posts


class SocialMediaExecutor(BaseNodeExecutor):
    """
    Executor for SOCIAL_MEDIA nodes.

    Fetches data from social media platforms (currently Reddit).
    """

    async def execute(
        self,
        inputs: dict[str, object],
        config: dict[str, object],
        context: dict[str, object] | None = None,
    ) -> dict[str, object]:
        """
        Execute social media node.

        Args:
            inputs: Not used for this node type.
            config: Must contain platform-specific configuration.
            context: Optional execution context.

        Returns:
            Dictionary with 'posts' and 'trends' keys.
        """
        platform = str(config.get("platform", "reddit"))

        if platform == "reddit":
            result = await self._fetch_reddit_data(config)
            # Pass through inputs for chained workflows
            merged = self.merge_inputs(inputs)
            merged.update(result)
            return merged

        raise ValueError(f"Unsupported platform: {platform}")

    async def _fetch_reddit_data(self, config: dict[str, object]) -> dict[str, object]:
        """
        Fetch data from Reddit.

        Args:
            config: Configuration with subreddit, sort, and limit.

        Returns:
            Reddit posts and extracted insights.
        """
        subreddit = str(config.get("subreddit", "all"))
        sort = str(config.get("sort", "hot"))
        limit = config.get("limit", 10)

        if not isinstance(limit, int):
            limit = 10

        # We assume fetch_subreddit_posts returns dict[str, object]
        return await fetch_subreddit_posts(subreddit, sort, limit)

    def validate_config(self, config: dict[str, object]) -> bool:
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
