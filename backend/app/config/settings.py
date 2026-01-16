"""Application settings and configuration."""

from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    supabase_url: str
    supabase_publishable_key: str
    supabase_secret_api_key: str
    fal_key: str
    rapid_api_key: str = ""  # Optional, for Reddit fallback

    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
