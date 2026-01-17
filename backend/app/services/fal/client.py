import os

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
    parameters: dict[str, object] | None = None,
) -> dict[str, object]:
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

    # normalize_params should be updated to not use generic types as well if possible,
    # but for now we'll treat it as object
    params = normalize_params(model_id, params)

    try:
        result = await fal_client.run_async(model_id, arguments=params)
    except Exception as e:
        raise RuntimeError(
            f"Failed to generate images with model {model_id}: {str(e)}"
        ) from e

    # Safely extract image URLs - validate result is dict before access
    if not isinstance(result, dict):
        result = {}
    images = result.get("images", [])
    if not isinstance(images, list):
        images = []

    image_urls = [
        str(img.get("url"))
        for img in images
        if isinstance(img, dict) and img.get("url")
    ]

    # Safely calculate cost
    price = get_model_price(model_id)
    price_per_image = 0.01 if price is None else price
    cost = float(price_per_image) * len(image_urls)

    output: dict[str, object] = {
        "image_urls": image_urls,
        "cost": cost,
    }

    if isinstance(result, dict):
        for key, value in result.items():
            if key not in {"images", "image_urls", "cost"}:
                output[key] = value

    return output
