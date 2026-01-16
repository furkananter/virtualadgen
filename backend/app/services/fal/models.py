"""FAL AI model configurations and parameter normalization."""

from typing import TypedDict, Literal


AspectFormat = Literal["ratio", "snake_case", "dimensions"]


class ModelConfig(TypedDict, total=False):
    """Configuration for a FAL AI model."""

    name: str
    price: float
    description: str
    aspect_format: AspectFormat
    aspect_param: str
    unsupported_params: list[str]


MODELS: dict[str, ModelConfig] = {
    "fal-ai/flux/schnell": {
        "name": "FLUX Schnell",
        "price": 0.003,
        "description": "Fast, high-quality image generation",
        "aspect_format": "snake_case",
        "aspect_param": "image_size",
        "unsupported_params": [],
    },
    "fal-ai/fast-lightning-sdxl": {
        "name": "SDXL Lightning",
        "price": 0.002,
        "description": "Fast Stable Diffusion XL generation",
        "aspect_format": "ratio",
        "aspect_param": "aspect_ratio",
        "unsupported_params": [],
    },
    "fal-ai/gpt-image-1.5": {
        "name": "GPT Image 1.5",
        "price": 0.02,
        "description": "OpenAI's native multimodal image generation",
        "aspect_format": "dimensions",
        "aspect_param": "image_size",
        "unsupported_params": ["guidance_scale", "num_inference_steps"],
    },
    "fal-ai/nano-banana": {
        "name": "Nano Banana",
        "price": 0.003,
        "description": "Google Gemini image generation",
        "aspect_format": "ratio",
        "aspect_param": "aspect_ratio",
        "unsupported_params": ["guidance_scale", "num_inference_steps"],
    },
}


ASPECT_CONVERSIONS: dict[AspectFormat, dict[str, str]] = {
    "ratio": {
        "1:1": "1:1",
        "4:5": "4:5",
        "9:16": "9:16",
        "16:9": "16:9",
        "4:3": "4:3",
        "3:4": "3:4",
    },
    "snake_case": {
        "1:1": "square",
        "4:5": "portrait_4_3",  # Closest match
        "9:16": "portrait_16_9",
        "16:9": "landscape_16_9",
        "4:3": "landscape_4_3",
        "3:4": "portrait_4_3",
    },
    "dimensions": {
        "1:1": "1024x1024",
        "4:5": "1024x1536",
        "9:16": "1024x1536",
        "16:9": "1536x1024",
        "4:3": "1536x1024",
        "3:4": "1024x1536",
    },
}


def convert_aspect_ratio(aspect: str, target_format: AspectFormat) -> str:
    """Convert aspect ratio to target format."""
    conversion_map = ASPECT_CONVERSIONS.get(target_format, {})
    return conversion_map.get(aspect, aspect)


def normalize_params(model_id: str, params: dict) -> dict:
    """Normalize parameters for a specific model."""
    config = MODELS.get(model_id)
    if not config:
        return params

    result = params.copy()

    aspect = result.pop("aspect_ratio", None)
    if aspect:
        target_format = config.get("aspect_format", "ratio")
        param_name = config.get("aspect_param", "aspect_ratio")
        result[param_name] = convert_aspect_ratio(aspect, target_format)

    for key in config.get("unsupported_params", []):
        result.pop(key, None)

    return result


def get_model_config(model_id: str) -> ModelConfig | None:
    """Get configuration for a specific model."""
    return MODELS.get(model_id)


def get_all_models() -> list[dict]:
    """Get all supported models for API response."""
    return [
        {
            "id": model_id,
            "name": config.get("name", "Unknown Model"),
            "price_per_image": config.get("price", 0.0),
            "description": config.get("description", ""),
        }
        for model_id, config in MODELS.items()
    ]


def get_model_price(model_id: str) -> float:
    """Get price for a specific model."""
    config = MODELS.get(model_id)
    return config.get("price", 0.01) if config else 0.01


def supports_advanced_params(model_id: str) -> bool:
    """Check if model supports guidance_scale and num_inference_steps."""
    config = MODELS.get(model_id)
    if not config:
        return True
    unsupported = config.get("unsupported_params", [])
    return "guidance_scale" not in unsupported
