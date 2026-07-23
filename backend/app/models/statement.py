from datetime import date as date_type, datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import Column, String, ForeignKey
from sqlmodel import Field, SQLModel


class Statement(SQLModel, table=True):
    __tablename__ = "statements"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    account_id: str = Field(
        sa_column=Column(String(255), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    )
    filename: str = Field(sa_column=Column(String(255), nullable=False))
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    period_start_date: Optional[date_type] = Field(default=None)
    period_end_date: Optional[date_type] = Field(default=None)
    transaction_count: int = Field(default=0)
    raw_text: Optional[str] = Field(default=None, sa_column=Column(String(10000), nullable=True))
