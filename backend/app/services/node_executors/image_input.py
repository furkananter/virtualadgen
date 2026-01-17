"""Image input node executor."""

from .base import BaseNodeExecutor


class ImageInputExecutor(BaseNodeExecutor):
    """
    Executor for IMAGE_INPUT nodes.

    Outputs an image URL from the node configuration.
    """

    async def execute(
        self,
        inputs: dict[str, object],
        config: dict[str, object],
        context: dict[str, object] | None = None,
    ) -> dict[str, object]:
        """
        Execute image input node.

        Args:
            inputs: Not used for this node type.
            config: Must contain 'image_url' key.
            context: Optional execution context.

        Returns:
            Dictionary with 'image_url' key.
        """
        image_url = str(config.get("image_url", ""))
        return {"image_url": image_url}

    def validate_config(self, config: dict[str, object]) -> bool:
        """
        Validate image input configuration.

        Args:
            config: Node configuration.

        Returns:
            True if 'image_url' key exists.
        """
        return "image_url" in config
