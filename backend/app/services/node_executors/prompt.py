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
            "You are a professional prompt engineer for image generation models like Stable Diffusion, Flux, and Midjourney. "
            "Your task is to take a raw, simple prompt and transform it into a highly detailed, cinematic, and professional image generation prompt. "
            "Focus on: lighting, camera angles, textures, artistic style, and specific details. "
            "Keep the core intent of the original prompt but make it breathtaking. "
            "IMPORTANT: Return ONLY the final prompt text, no explanations or conversational text."
        )

        try:
            result = await fal_client.run_async(
                "openrouter/router",
                arguments={
                    "model": "google/gemini-2.0-flash-001",
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
