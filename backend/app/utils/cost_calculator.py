"""Cost calculation utilities for FAL AI models."""

from app.services.fal import get_model_price

DEFAULT_COST_PER_IMAGE = 0.01


def calculate_cost(model_id: str, num_images: int) -> float:
    """
    Calculate cost for image generation.

    Args:
        model_id: FAL AI model identifier.
        num_images: Number of images generated.

    Returns:
        Total cost in USD.
    """
    price = get_model_price(model_id)
    if price is None:
        price = DEFAULT_COST_PER_IMAGE
    return price * num_images


def calculate_workflow_cost(generations: list[dict]) -> float:
    """
    Calculate total cost for a workflow execution.

    Args:
        generations: List of generation records with model_id and image count.

    Returns:
        Total cost in USD.
    """
    total = 0.0
    for gen in generations:
        model_id = gen.get("model_id", "")
        num_images = len(gen.get("image_urls") or [])
        total += calculate_cost(model_id, num_images)
    return total
