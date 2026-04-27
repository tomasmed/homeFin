from sqlmodel import Field, SQLModel
from uuid import uuid4
from datetime import datetime
from enum import Enum
from typing import Optional


class AccountType(str, Enum):
    checking = "checking"
    savings = "savings"
    credit = "credit"
    investment = "investment"


class Account(SQLModel, table=True):
    __tablename__ = "accounts"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    name: str = Field(index=True)
    institution: str = Field(index=True)
    account_type: AccountType = Field(default=AccountType.checking)
    currency: str = Field(default="USD")
    created_at: datetime = Field(default_factory=datetime.utcnow)
