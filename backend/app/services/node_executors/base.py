"""Base class for node executors."""

from abc import ABC, abstractmethod
from typing import Any


class BaseNodeExecutor(ABC):
    """
    Abstract base class for all node executors.

    Each executor handles a specific node type and transforms
    inputs based on the node's configuration.
    """

    @abstractmethod
    async def execute(
        self,
        inputs: dict[str, Any],
        config: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Execute the node logic.

        Args:
            inputs: Dictionary of inputs from connected source nodes.
            config: Node configuration from the database.
            context: Optional execution context (e.g., execution_id).

        Returns:
            Dictionary of outputs to pass to connected target nodes.
        """
        pass

    def validate_config(self, config: dict[str, Any]) -> bool:
        """
        Validate the node configuration.

        Args:
            config: Node configuration to validate.

        Returns:
            True if configuration is valid.
        """
        return True

    def merge_inputs(self, inputs: dict[str, Any]) -> dict[str, Any]:
        """
        Merge all inputs into a flat dictionary.

        Args:
            inputs: Dictionary of inputs from source nodes.

        Returns:
            Flattened input dictionary.
        """
        merged: dict[str, Any] = {}
        for source_outputs in inputs.values():
            if isinstance(source_outputs, dict):
                merged.update(source_outputs)
        return merged
