"""Supabase client factory."""

from supabase import create_client, Client

from app.config import settings


def get_supabase_client() -> Client:
    """
    Create and return a Supabase client with service role key.

    Returns:
        Supabase client instance.
    """
    return create_client(settings.supabase_url, settings.supabase_secret_api_key)


def get_public_supabase_client() -> Client:
    """
    Create and return a Supabase client with publishable key.

    Returns:
        Supabase client instance for public operations.
    """
    return create_client(settings.supabase_url, settings.supabase_publishable_key)
