from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, SQLModel

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine, class_=Session, autoflush=False, autocommit=False)
metadata = SQLModel.metadata


def get_db():
    """Yield a database session for request handlers."""
    with SessionLocal() as session:
        yield session
