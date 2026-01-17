from .base import BaseNodeExecutor
from app.services.fal import generate_images
from app.services.fal.models import (
    get_edit_model_id,
    get_model_config,
)
from app.services.supabase import get_supabase_client, create_generation


class ImageModelExecutor(BaseNodeExecutor):
    """
    Executor for IMAGE_MODEL nodes.

        Calls FAL AI to generate images and records the generation.
        Automatically routes to edit models when image input is provided.
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
                    May contain 'image_url' for image-to-image generation.
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
        core_params = dict(raw_params) if isinstance(raw_params, dict) else {}
        parameters = core_params.copy()

        num_images = core_params.get("num_images", 1)
        aspect_ratio = core_params.get("aspect_ratio", "1:1")

        output_config = (context or {}).get("output_config", {})
        if isinstance(output_config, dict):
            if "num_images" in output_config:
                num_images = int(output_config.get("num_images") or num_images)
            if "aspect_ratio" in output_config:
                aspect_ratio = str(output_config.get("aspect_ratio") or aspect_ratio)

        parameters["num_images"] = num_images
        parameters["aspect_ratio"] = aspect_ratio

        # Check for image input and route to edit model if available
        image_url = merged.get("image_url")
        if image_url:
            edit_model_id = get_edit_model_id(model_id)
            if edit_model_id:
                model_id = edit_model_id

            # Dynamically set image parameter based on model config
            model_config = get_model_config(model_id)
            if model_config:
                image_param = model_config.get("image_param", "image_url")
                image_as_list = model_config.get("image_as_list", False)
                if image_as_list:
                    parameters[image_param] = [str(image_url)]
                else:
                    parameters[image_param] = str(image_url)
            else:
                # Fallback to standard
                parameters["image_url"] = str(image_url)
        # We assume generate_images handles these types correctly and returns dict[str, object]
        result = await generate_images(
            model_id=model_id,
            prompt=prompt,
            num_images=(
                int(num_images) if not isinstance(num_images, int) else num_images
            ),
            parameters=parameters,
        )

        # Upload FAL images to Supabase Storage for persistence
        fal_image_urls = list(result.get("image_urls", []))  # type: ignore
        storage_image_urls = fal_image_urls  # fallback

        if context and "user_id" in context:
            from app.services.supabase import upload_images_from_urls

            user_id = str(context["user_id"])
            storage_image_urls = await upload_images_from_urls(user_id, fal_image_urls)
            result["image_urls"] = storage_image_urls

        if context and "execution_id" in context:
            execution_id = str(context["execution_id"])
            client = get_supabase_client()
            await create_generation(
                client=client,
                execution_id=execution_id,
                model_id=model_id,
                prompt=prompt,
                parameters=parameters,
                image_urls=storage_image_urls,
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
