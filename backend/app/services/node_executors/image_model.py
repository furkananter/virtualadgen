"""Image model node executor."""

from .base import BaseNodeExecutor
from app.services.fal import generate_images
from app.services.supabase import get_supabase_client, create_generation


class ImageModelExecutor(BaseNodeExecutor):
    """
    Executor for IMAGE_MODEL nodes.

    Calls FAL AI to generate images and records the generation.
    """

    async def execute(
        self,
        inputs: dict[str, object],
        config: dict[str, object],
        context: dict[str, object] | None = None,
    ) -> dict[str, object]:
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
        prompt_val = merged.get("prompt")
        prompt = str(prompt_val) if prompt_val is not None and prompt_val != "" else ""

        if not prompt:
            raise ValueError("No prompt provided to image model node")

        model_id = str(config.get("model", "fal-ai/flux/schnell"))

        raw_params = config.get("parameters", {})
        parameters = dict(raw_params) if isinstance(raw_params, dict) else {}

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

        # We assume generate_images handles these types correctly and returns dict[str, object]
        result = await generate_images(
            model_id=model_id,
            prompt=prompt,
            num_images=(
                int(num_images) if not isinstance(num_images, int) else num_images
            ),
            parameters=parameters,
        )

        if context and "execution_id" in context:
            execution_id = str(context["execution_id"])
            client = get_supabase_client()
            await create_generation(
                client=client,
                execution_id=execution_id,
                model_id=model_id,
                prompt=prompt,
                parameters=parameters,
                image_urls=list(result.get("image_urls", [])),  # type: ignore
                aspect_ratio=str(aspect_ratio),
                cost=float(result.get("cost", 0.0)),  # type: ignore
            )

        # Return all FAL metadata for inspector visibility
        return result

    def validate_config(self, config: dict[str, object]) -> bool:
        """
        Validate image model configuration.

        Args:
            config: Node configuration.

        Returns:
            True if 'model' key exists.
        """
        return "model" in config
