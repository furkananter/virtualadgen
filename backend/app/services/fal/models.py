from typing import TypedDict, Literal


AspectFormat = Literal["ratio", "snake_case", "dimensions"]


class ModelConfig(TypedDict, total=False):
    """Configuration for a FAL AI model."""

    name: str
    price: float
    description: str
    aspect_format: AspectFormat
    aspect_param: str
    image_param: str
    image_as_list: bool
    unsupported_params: list[str]


MODELS: dict[str, ModelConfig] = {
    "fal-ai/flux/schnell/redux": {
        "name": "FLUX Redux",
        "price": 0.025,
        "description": "High-quality Flux image-to-image with aspect ratio support",
        "aspect_format": "snake_case",
        "aspect_param": "image_size",
        "image_param": "image_url",
        "image_as_list": False,
        "unsupported_params": [],
    },
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
        "description": "Fast SDXL text-to-image",
        "aspect_format": "snake_case",
        "aspect_param": "image_size",
        "image_param": "image_url",
        "image_as_list": False,
        "unsupported_params": ["guidance_scale"],
    },
    "fal-ai/nano-banana": {
        "name": "Nano Banana",
        "price": 0.003,
        "description": "Google Gemini image generation",
        "aspect_format": "ratio",
        "aspect_param": "aspect_ratio",
        "image_param": "image_url",
        "image_as_list": False,
        "unsupported_params": ["guidance_scale", "num_inference_steps"],
    },
    # Edit model variants (image-to-image)
    "fal-ai/nano-banana/edit": {
        "name": "Nano Banana Edit",
        "price": 0.003,
        "description": "Google Gemini image editing",
        "aspect_format": "ratio",
        "aspect_param": "aspect_ratio",
        "image_param": "image_urls",
        "image_as_list": True,
        "unsupported_params": ["guidance_scale", "num_inference_steps"],
    },
    "fal-ai/fast-lightning-sdxl/image-to-image": {
        "name": "SDXL Lightning",
        "price": 0.002,
        "description": "Fast SDXL image-to-image",
        "aspect_format": "snake_case",
        "aspect_param": "image_size",
        "image_param": "image_url",
        "image_as_list": False,
        "unsupported_params": ["guidance_scale"],
    },
}


# Mapping from base model to edit variant
EDIT_MODEL_VARIANTS: dict[str, str] = {
    "fal-ai/nano-banana": "fal-ai/nano-banana/edit",
    "fal-ai/fast-lightning-sdxl": "fal-ai/fast-lightning-sdxl/image-to-image",
    "fal-ai/flux/schnell": "fal-ai/flux/schnell/redux",
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
        "1:1": "square_hd",
        "4:5": "portrait_4_3",
        "9:16": "portrait_16_9",
        "16:9": "landscape_16_9",
        "4:3": "landscape_4_3",
        "3:4": "portrait_4_3",
    },
    "dimensions": {
        "1:1": "1024x1024",
        "4:5": "1024x1280",
        "9:16": "1024x1792",
        "16:9": "1792x1024",
        "4:3": "1280x1024",
        "3:4": "1024x1280",
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
        converted = convert_aspect_ratio(aspect, target_format)
        result[param_name] = converted

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


def get_edit_model_id(model_id: str) -> str | None:
    """Get the edit variant of a model if available."""
    return EDIT_MODEL_VARIANTS.get(model_id)


def supports_image_editing(model_id: str) -> bool:
    """Check if model has an image editing variant."""
    return model_id in EDIT_MODEL_VARIANTS
