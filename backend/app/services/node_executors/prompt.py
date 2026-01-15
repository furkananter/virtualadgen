"""Prompt template node executor."""

import re
from typing import Any

from .base import BaseNodeExecutor


class PromptExecutor(BaseNodeExecutor):
    """
    Executor for PROMPT nodes.

    Processes a template string and replaces variables with input values.
    Uses {{variable}} syntax for template variables.
    """

    async def execute(
        self,
        inputs: dict[str, Any],
        config: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Execute prompt template node.

        Args:
            inputs: Dictionary of inputs from connected source nodes.
            config: Must contain 'template' key with template string.
            context: Optional execution context.

        Returns:
            Dictionary with 'prompt' key containing processed template.
        """
        template = config.get("template", "")
        merged_inputs = self.merge_inputs(inputs)
        prompt = self._process_template(template, merged_inputs)
        return {"prompt": prompt}

    def _process_template(self, template: str, variables: dict[str, Any]) -> str:
        """
        Replace template variables with actual values.

        Args:
            template: Template string with {{variable}} placeholders.
            variables: Dictionary of variable values.

        Returns:
            Processed string with variables replaced.
        """
        pattern = r"\{\{(\w+)\}\}"

        def replace_var(match: re.Match) -> str:
            var_name = match.group(1)
            value = variables.get(var_name, "")
            if isinstance(value, list):
                return ", ".join(str(item) for item in value)
            return str(value)

        return re.sub(pattern, replace_var, template)

    def validate_config(self, config: dict[str, Any]) -> bool:
        """
        Validate prompt configuration.

        Args:
            config: Node configuration.

        Returns:
            True if 'template' key exists.
        """
        return "template" in config
