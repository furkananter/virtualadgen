"""Supabase Storage service for uploading images."""

import asyncio
import uuid
import httpx
from .client import get_supabase_client

GENERATED_IMAGES_BUCKET = "generated-images"


async def upload_image_from_url(
    user_id: str,
    image_url: str,
    content_type: str = "image/png",
) -> str:
    """
    Download image from URL and upload to Supabase Storage.

    Args:
        user_id: User ID for RLS (used as folder prefix).
        image_url: Source URL to download image from.
        content_type: MIME type of the image.

    Returns:
        Signed URL of the uploaded image (expires in 14 days).

    Raises:
        Exception: If download or upload fails.
    """
    # Download image from FAL
    async with httpx.AsyncClient(timeout=30.0) as http:
        response = await http.get(image_url)
        response.raise_for_status()
        image_bytes = response.content
        # Get content type from response if available
        if response.headers.get("content-type"):
            content_type = response.headers["content-type"].split(";")[0]

    # Determine extension from content type
    ext = "png"
    if "jpeg" in content_type or "jpg" in content_type:
        ext = "jpg"
    elif "webp" in content_type:
        ext = "webp"

    # Build path: {user_id}/{uuid}.{ext}
    file_path = f"{user_id}/{uuid.uuid4()}.{ext}"

    client = get_supabase_client()
    bucket = client.storage.from_(GENERATED_IMAGES_BUCKET)

    # Upload to storage (run in thread to avoid blocking event loop)
    upload_result = await asyncio.to_thread(
        bucket.upload,
        file_path,
        image_bytes,
        {"content-type": content_type, "upsert": "true"},
    )

    # Check for errors
    if hasattr(upload_result, "error") and upload_result.error:
        raise Exception(f"Storage upload failed: {upload_result.error}")

    # Create signed URL for private bucket (14 days expiry)
    signed_url_result = await asyncio.to_thread(
        bucket.create_signed_url, file_path, 60 * 60 * 24 * 14
    )

    if hasattr(signed_url_result, "error") and signed_url_result.error:
        raise Exception(f"Failed to create signed URL: {signed_url_result.error}")

    signed_url = signed_url_result.get("signedURL") or signed_url_result.get(
        "signedUrl"
    )
    if not signed_url:
        raise Exception("Failed to get signed URL from response")

    return signed_url


async def upload_images_from_urls(
    user_id: str,
    image_urls: list[str],
) -> list[str]:
    """
    Upload multiple images from URLs to Supabase Storage.

    Args:
        user_id: User ID for RLS folder.
        image_urls: List of source URLs.

    Returns:
        List of signed Supabase Storage URLs (expire in 14 days).
    """
    uploaded_urls: list[str] = []
    for url in image_urls:
        try:
            storage_url = await upload_image_from_url(user_id, url)
            uploaded_urls.append(storage_url)
        except Exception:
            # Fallback to original URL if upload fails
            uploaded_urls.append(url)
    return uploaded_urls
