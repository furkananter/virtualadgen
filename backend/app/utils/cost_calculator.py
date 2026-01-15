"""Cost calculation utilities for image generation."""

MODEL_PRICING: dict[str, float] = {
    "fal-ai/flux/schnell": 0.003,
    "fal-ai/flux/dev": 0.025,
    "fal-ai/stable-diffusion-xl": 0.002,
}

DEFAULT_COST_PER_IMAGE = 0.01


def calculate_cost(model_id: str, num_images: int) -> float:
    """
    Calculate the cost for image generation.

    Args:
        model_id: The FAL AI model identifier.
        num_images: Number of images generated.

    Returns:
        Total cost for the generation.
    """
    price_per_image = MODEL_PRICING.get(model_id, DEFAULT_COST_PER_IMAGE)
    return price_per_image * num_images


def get_total_execution_cost(generation_costs: list[float]) -> float:
    """
    Calculate total cost for an entire workflow execution.

    Args:
        generation_costs: List of individual generation costs.

    Returns:
        Sum of all generation costs.
    """
    return sum(generation_costs)
