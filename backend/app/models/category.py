from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlmodel import Field, Session, SQLModel, select


class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    name: str = Field(index=True, unique=True)
    parent_id: Optional[str] = Field(default=None, foreign_key="categories.id", index=True)
    color_hex: str = Field(default="#6b7280")  # Optional - allows random color generation
    icon_slug: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CategoryInput(SQLModel):
    """Input model for creating a category."""
    name: str
    icon_slug: str
    color_hex: Optional[str] = None


def seed_categories(session: Session) -> None:
    """Insert the default category set if it is missing."""
    base_categories = [
        {"name": "Food & Dining", "icon_slug": "food"},
        {"name": "Transport", "icon_slug": "transport"},
        {"name": "Housing", "icon_slug": "home"},
        {"name": "Utilities", "icon_slug": "utilities"},
        {"name": "Entertainment", "icon_slug": "entertainment"},
        {"name": "Health", "icon_slug": "health"},
        {"name": "Shopping", "icon_slug": "shopping"},
        {"name": "Income", "icon_slug": "income"},
        {"name": "Transfer", "icon_slug": "transfer"},
        {"name": "Uncategorized", "icon_slug": "folder"},
    ]

    existing_names = set(session.exec(select(Category.name)).all())

    for category_data in base_categories:
        if category_data["name"] in existing_names:
            continue

        session.add(Category(**category_data))

    session.commit()
