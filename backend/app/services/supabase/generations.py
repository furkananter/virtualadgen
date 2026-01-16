"""Generation database operations."""

from supabase import Client


async def create_generation(
    client: Client,
    execution_id: str,
    model_id: str,
    prompt: str,
    parameters: dict,
    image_urls: list[str],
    aspect_ratio: str,
    cost: float,
) -> dict:
    """
    Create a generation record.

    Args:
        client: Supabase client instance.
        execution_id: UUID of the execution.
        model_id: FAL AI model ID.
        prompt: Generation prompt.
        parameters: Generation parameters.
        image_urls: List of generated image URLs.
        aspect_ratio: Image aspect ratio.
        cost: Generation cost.

    Returns:
        Created generation record.
    """
    result = (
        client.table("generations")
        .insert(
            {
                "execution_id": execution_id,
                "model_id": model_id,
                "prompt": prompt,
                "parameters": parameters,
                "image_urls": image_urls,
                "aspect_ratio": aspect_ratio,
                "cost": cost,
            }
        )
        .execute()
    )
    return result.data[0]
