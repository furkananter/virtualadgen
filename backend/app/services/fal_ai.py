"""FAL AI integration for image generation."""

import os
from typing import Any

import fal_client

from app.utils.cost_calculator import calculate_cost

_fal_initialized = False


def _ensure_fal_initialized() -> None:
    """Lazily initialize FAL API key on first use."""
    global _fal_initialized
    if not _fal_initialized:
        from app.config import settings

        os.environ["FAL_KEY"] = settings.fal_key
        _fal_initialized = True


async def generate_images(
    model_id: str,
    prompt: str,
    num_images: int = 1,
    parameters: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Generate images using FAL AI.

    Args:
        model_id: The FAL AI model identifier.
        prompt: The image generation prompt.
        num_images: Number of images to generate.
        parameters: Additional model parameters.

    Returns:
        Dictionary containing image_urls and cost.
    """
    _ensure_fal_initialized()

    params = parameters or {}
    params["prompt"] = prompt
    params["num_images"] = num_images

    result = await fal_client.run_async(model_id, arguments=params)

    image_urls = [img["url"] for img in result.get("images", [])]
    cost = calculate_cost(model_id, len(image_urls))

    return {
        "image_urls": image_urls,
        "cost": cost,
    }


def get_supported_models() -> list[dict[str, Any]]:
    """
    Get list of supported FAL AI models with pricing.

    Returns:
        List of model information dictionaries.
    """
    return [
        {
            "id": "fal-ai/flux/schnell",
            "name": "FLUX Schnell",
            "price_per_image": 0.003,
            "description": "Fast, high-quality image generation",
        },
        {
            "id": "fal-ai/flux/dev",
            "name": "FLUX Dev",
            "price_per_image": 0.025,
            "description": "Development model with enhanced features",
        },
        {
            "id": "fal-ai/stable-diffusion-xl",
            "name": "Stable Diffusion XL",
            "price_per_image": 0.002,
            "description": "High-resolution image generation",
        },
    ]
