"""Output node executor."""

from .base import BaseNodeExecutor


class OutputExecutor(BaseNodeExecutor):
    """
    Executor for OUTPUT nodes.

    Filters and limits the final image outputs.
    """

    async def execute(
        self,
        inputs: dict[str, object],
        config: dict[str, object],
        context: dict[str, object] | None = None,
    ) -> dict[str, list[str]]:
        """
        Execute output node.

        Args:
            inputs: Must contain 'image_urls' from connected image model node.
            config: Optional 'num_images' and 'aspect_ratio' for filtering.
            context: Optional execution context.

        Returns:
            Dictionary with 'final_images' key.
        """
        merged = self.merge_inputs(inputs)
        image_urls = merged.get("image_urls", [])

        if not isinstance(image_urls, list):
            image_urls = [image_urls] if image_urls else []

        # image_urls might contain non-string objects, but based on usage they should be strings
        # We'll treat them as objects for now to be safe, but return list[str] as promised
        num_images = config.get("num_images", len(image_urls))
        if not isinstance(num_images, int):
            num_images = len(image_urls)

        final_images = [str(url) for url in image_urls[:num_images]]

        return {"final_images": final_images}

    def validate_config(self, config: dict[str, object]) -> bool:
        """
        Validate output configuration.

        Args:
            config: Node configuration.

        Returns:
            Always returns True as config is optional.
        """
        return True
