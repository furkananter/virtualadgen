"""FAL AI client for image generation."""

import os
from typing import Any

import fal_client

from .models import normalize_params, get_model_price

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
        Dictionary containing image_urls, cost, and model metadata.
    """
    _ensure_fal_initialized()

    params = parameters.copy() if parameters else {}
    params["prompt"] = prompt
    params["num_images"] = num_images

    params = normalize_params(model_id, params)

    try:
        result = await fal_client.run_async(model_id, arguments=params)
    except Exception as e:
        raise RuntimeError(
            f"Failed to generate images with model {model_id}: {str(e)}"
        ) from e

    # Safely extract image URLs
    images = result.get("images", [])
    image_urls = [
        img.get("url") for img in images if isinstance(img, dict) and img.get("url")
    ]

    # Safely calculate cost
    price = get_model_price(model_id)
    price_per_image = 0.01 if price is None else price
    cost = price_per_image * len(image_urls)

    output = {
        "image_urls": image_urls,
        "cost": cost,
    }

    for key, value in result.items():
        if key not in {"images", "image_urls", "cost"}:
            output[key] = value

    return output
