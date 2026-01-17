"""Text input node executor."""

from .base import BaseNodeExecutor


class TextInputExecutor(BaseNodeExecutor):
    """
    Executor for TEXT_INPUT nodes.

    Outputs a text value from the node configuration.
    """

    async def execute(
        self,
        inputs: dict[str, object],
        config: dict[str, object],
        context: dict[str, object] | None = None,
    ) -> dict[str, object]:
        """
        Execute text input node.

        Args:
            inputs: Not used for this node type.
            config: Must contain 'value' key with text string.
            context: Optional execution context.

        Returns:
            Dictionary with 'text' key containing the configured value.
        """
        # We ensure the return is a string, treating None as empty
        raw_value = config.get("value")
        text_value = str(raw_value) if raw_value is not None else ""
        return {"text": text_value}

    def validate_config(self, config: dict[str, object]) -> bool:
        """
        Validate text input configuration.

        Args:
            config: Node configuration.

        Returns:
            True if 'value' key exists.
        """
        return "value" in config
