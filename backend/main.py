import logging
from os import environ

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
from sqlmodel import SQLModel

from app.core.config import get_settings
from app.models import engine, seed_categories
from app.models.base import SessionLocal
from app.routers.api import router as api_router

settings = get_settings()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered financial transaction management API",
    version=settings.VERSION,
    docs_url="/docs",
)

# Add CORS middleware to allow frontend requests
# Allow CORS origins via environment variable (comma-separated), fallback to development defaults
ALLOWED_ORIGINS = environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [orig.strip() for orig in ALLOWED_ORIGINS.split(",") if orig.strip()]

# Check for wildcard - if not explicitly set, add it for development
if not "*" in origins:
    origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"^(https?://[^\s]+)$",  # Better regex support for origins
)

app.include_router(api_router, prefix="/v1")


@app.on_event("startup")
def startup_event() -> None:
    """Create the schema and seed reference data."""
    try:
        SQLModel.metadata.create_all(engine)
        with SessionLocal() as session:
            seed_categories(session)
    except OperationalError as exc:
        logger.warning(
            "Database startup skipped: %s. Check backend/.env or backend/.env.local when running outside Docker.",
            exc,
        )


@app.get("/")
def root():
    return {"message": settings.PROJECT_NAME}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
