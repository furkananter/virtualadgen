"""Prompt template node executor."""

import logging
import re

from .base import BaseNodeExecutor

logger = logging.getLogger(__name__)


class PromptExecutor(BaseNodeExecutor):
    """
    Executor for PROMPT nodes.

    Processes a template string and replaces variables with input values.
    Uses {{variable}} syntax for template variables.
    """

    async def execute(
        self,
        inputs: dict[str, object],
        config: dict[str, object],
        context: dict[str, object] | None = None,
    ) -> dict[str, object]:
        """
        Execute prompt template node.

        Args:
            inputs: Dictionary of inputs from connected source nodes.
            config: Must contain 'template' key with template string.
            context: Optional execution context.

        Returns:
            Dictionary with 'prompt' key containing processed template.
        """
        template_val = config.get("template")
        template = str(template_val) if template_val is not None else ""
        merged_inputs = self.merge_inputs(inputs)
        prompt = self._process_template(template, merged_inputs)

        # AI Optimization
        if config.get("ai_optimize"):
            optimized_prompt = await self._optimize_with_ai(prompt)
            if optimized_prompt:
                prompt = optimized_prompt

        # Build output, pass through image_url if present for image-to-image
        output: dict[str, object] = {"prompt": prompt}
        if "image_url" in merged_inputs:
            output["image_url"] = str(merged_inputs["image_url"])

        return output

    async def _optimize_with_ai(self, raw_prompt: str) -> str | None:
        """Use FAL AI LLM to optimize the prompt for image generation."""
        import fal_client
        from app.services.fal.client import _ensure_fal_initialized

        _ensure_fal_initialized()

        system_prompt = (
            "You are an expert Performance Marketing Creative Strategist. "
            "Your goal is to write image prompts that generate high-CTR (Click-Through Rate) advertising visuals for social media (Instagram/Facebook/TikTok). "
            "Transform the input into a crisp, commercial product image description. "
            "Rules: "
            "1. The product/subject must be the absolute hero: clear, sharp, and center stage. "
            "2. Lighting: Use professional commercial lighting (softbox, rim lighting) to make the product pop. "
            "3. Background: Keep it complementary but not distracting. Avoid clutter. "
            "4. Aesthetics: Bright, vibrant, and expensive-looking. Think high-end e-commerce or Apple-style minimalism. "
            "5. NO chatty text, NO '/imagine' commands. Return ONLY the prompt string."
        )

        try:
            result = await fal_client.run_async(
                "openrouter/router",
                arguments={
                    "model": "anthropic/claude-haiku-4.5",
                    "prompt": raw_prompt,
                    "system_prompt": system_prompt,
                },
            )

            if isinstance(result, dict) and "output" in result:
                return str(result["output"]).strip()
        except Exception:
            logger.warning("AI prompt optimization failed", exc_info=True)
            return None

        return None

    def _process_template(self, template: str, variables: dict[str, object]) -> str:
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

    def validate_config(self, config: dict[str, object]) -> bool:
        """
        Validate prompt configuration.

        Args:
            config: Node configuration.

        Returns:
            True if 'template' key exists.
        """
        return "template" in config
