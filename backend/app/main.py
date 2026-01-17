import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import execution, social

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s", force=True)
logger = logging.getLogger(__name__)


app = FastAPI(
    title="VisualAdGen API",
    description="Backend API for Visual Workflow Builder for Ad Generation",
    version="1.0.0",
)

# Get allowed origins from env, fallback to defaults
allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "https://virtualadgen-frontend.vercel.app,http://localhost:5173,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(execution.router)
app.include_router(social.router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """
    Health check endpoint.

    Returns:
        Status message indicating the API is running.
    """
    return {"status": "healthy"}
