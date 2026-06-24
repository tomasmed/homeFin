from datetime import date as date_type, datetime
from decimal import Decimal
from typing import Optional
from uuid import uuid4

from sqlalchemy import Column, Numeric, String, ForeignKey
from sqlmodel import Field, SQLModel


class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    account_id: str = Field(foreign_key="accounts.id", index=True)
    date: date_type = Field(index=True)
    amount: Decimal = Field(sa_column=Column(Numeric(12, 2), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=False))
    merchant_name: Optional[str] = Field(default=None, sa_column=Column(String(255), nullable=True))
    category_id: Optional[str] = Field(
        default=None, 
        sa_column=Column(String(255), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    )
    notes: str = Field(default="", sa_column=Column(String(1000), nullable=False))
    imported_at: datetime = Field(default_factory=datetime.utcnow)
