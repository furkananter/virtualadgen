"""Image model node executor."""

from typing import Any

from .base import BaseNodeExecutor
from app.services.fal_ai import generate_images
from app.services.supabase import get_supabase_client, create_generation


class ImageModelExecutor(BaseNodeExecutor):
    """
    Executor for IMAGE_MODEL nodes.

    Calls FAL AI to generate images and records the generation.
    """

    async def execute(
        self,
        inputs: dict[str, Any],
        config: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Execute image model node.

        Args:
            inputs: Must contain 'prompt' from connected prompt node.
            config: Must contain 'model' and optionally 'parameters'.
            context: Must contain 'execution_id' for recording generation.

        Returns:
            Dictionary with 'image_urls' and 'cost' keys.
        """
        merged = self.merge_inputs(inputs)
        prompt = merged.get("prompt", "")

        if not prompt:
            raise ValueError("No prompt provided to image model node")

        model_id = config.get("model", "fal-ai/flux/schnell")
        parameters = dict(config.get("parameters", {}))
        num_images = parameters.get("num_images", 1)
        aspect_ratio = parameters.get("aspect_ratio", "1:1")

        output_config = (context or {}).get("output_config", {})
        if isinstance(output_config, dict):
            if "num_images" in output_config:
                num_images = int(output_config.get("num_images") or num_images)
            if "aspect_ratio" in output_config:
                aspect_ratio = str(output_config.get("aspect_ratio") or aspect_ratio)

        parameters["num_images"] = num_images
        parameters["aspect_ratio"] = aspect_ratio

        result = await generate_images(
            model_id=model_id,
            prompt=prompt,
            num_images=num_images,
            parameters=parameters,
        )

        if context and "execution_id" in context:
            client = get_supabase_client()
            await create_generation(
                client=client,
                execution_id=context["execution_id"],
                model_id=model_id,
                prompt=prompt,
                parameters=parameters,
                image_urls=result["image_urls"],
                aspect_ratio=aspect_ratio,
                cost=result["cost"],
            )

        return {
            "image_urls": result["image_urls"],
            "cost": result["cost"],
        }

    def validate_config(self, config: dict[str, Any]) -> bool:
        """
        Validate image model configuration.

        Args:
            config: Node configuration.

        Returns:
            True if 'model' key exists.
        """
        return "model" in config
