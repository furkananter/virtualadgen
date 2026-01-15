"""Text input node executor."""

from typing import Any

from .base import BaseNodeExecutor


class TextInputExecutor(BaseNodeExecutor):
    """
    Executor for TEXT_INPUT nodes.

    Outputs a text value from the node configuration.
    """

    async def execute(
        self,
        inputs: dict[str, Any],
        config: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Execute text input node.

        Args:
            inputs: Not used for this node type.
            config: Must contain 'value' key with text string.
            context: Optional execution context.

        Returns:
            Dictionary with 'text' key containing the configured value.
        """
        text_value = config.get("value", "")
        return {"text": text_value}

    def validate_config(self, config: dict[str, Any]) -> bool:
        """
        Validate text input configuration.

        Args:
            config: Node configuration.

        Returns:
            True if 'value' key exists.
        """
        return "value" in config
