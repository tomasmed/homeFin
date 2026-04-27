from datetime import date, datetime
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, SQLModel, select

from app.models import (
    Account,
    Category,
    CategoryInput,
    Transaction,
    engine,
    get_db,
    seed_categories,
)

router = APIRouter(prefix="/api", tags=["API"])


@router.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


@router.get("/accounts", tags=["Accounts"])
def list_accounts(session: Session = Depends(get_db)):
    accounts = session.exec(select(Account)).all()
    return {
        "accounts": [
            {
                "id": account.id,
                "name": account.name,
                "institution": account.institution,
                "account_type": account.account_type.value,
                "currency": account.currency,
            }
            for account in accounts
        ]
    }


@router.post("/accounts", tags=["Accounts"])
def create_account(account: Account, session: Session = Depends(get_db)):
    db_account = Account(
        id=account.id or str(uuid4()),
        name=account.name,
        institution=account.institution,
        account_type=account.account_type,
        currency=account.currency,
    )
    session.add(db_account)
    session.commit()
    session.refresh(db_account)

    return {
        "account": {
            "id": db_account.id,
            "name": db_account.name,
            "institution": db_account.institution,
            "account_type": db_account.account_type.value,
            "currency": db_account.currency,
        }
    }


@router.get("/accounts/{account_id}", tags=["Accounts"])
def get_account(account_id: str, session: Session = Depends(get_db)):
    account = session.get(Account, account_id)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    return {
        "account": {
            "id": account.id,
            "name": account.name,
            "institution": account.institution,
            "account_type": account.account_type.value,
            "currency": account.currency,
        }
    }


@router.delete("/accounts/{account_id}", tags=["Accounts"])
def delete_account(account_id: str, session: Session = Depends(get_db)):
    account = session.get(Account, account_id)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    session.delete(account)
    session.commit()
    return {"message": "Account deleted successfully"}


@router.get("/categories", tags=["Categories"])
def list_categories(session: Session = Depends(get_db)):
    categories = session.exec(select(Category).order_by(Category.name)).all()
    return {
        "categories": [
            {
                "id": category.id,
                "name": category.name,
                "parent_id": category.parent_id,
                "icon_slug": category.icon_slug,
                "color_hex": category.color_hex,
            }
            for category in categories
        ]
    }


@router.get("/categories/{category_id}", tags=["Categories"])
def get_category(category_id: str, session: Session = Depends(get_db)):
    category = session.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    return {
        "category": {
            "id": category.id,
            "name": category.name,
            "parent_id": category.parent_id,
            "icon_slug": category.icon_slug,
            "color_hex": category.color_hex,
            "created_at": category.created_at.isoformat(),
        }
    }

@router.post("/categories", tags=["Categories"])
def create_category(category: CategoryInput, session: Session = Depends(get_db)):
    # Generate unique color if not provided
    if not category.color_hex:
        from secrets import token_hex
        # Generate a random 6-char hex color
        color_hex = "#" + token_hex(3)
    
    # Verify color doesn't conflict
    existing_categories = session.exec(select(Category)).all()
    if color_hex and color_hex in [c.color_hex for c in existing_categories]:
        # Collision - regenerate
        color_hex = "#" + token_hex(3)
        while color_hex in [c.color_hex for c in existing_categories]:
            color_hex = "#" + token_hex(3)
    
    db_category = Category(
        id=str(uuid4()),
        name=category.name,
        parent_id=None,  # No parent_id dependency for now
        color_hex=color_hex,
        icon_slug=category.icon_slug,
    )

    session.add(db_category)
    session.commit()
    session.refresh(db_category)

    return {
        "category": {
            "id": db_category.id,
            "name": db_category.name,
            "parent_id": db_category.parent_id,
            "icon_slug": db_category.icon_slug,
            "color_hex": db_category.color_hex,
            "created_at": db_category.created_at.isoformat(),
        }
    }


@router.put("/categories/{category_id}", tags=["Categories"])
def update_category(category_id: str, category_data: dict, session: Session = Depends(get_db)):
    # Fetch existing category
    category = session.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    # Extract and validate fields
    updates = {}

    if "name" in category_data:
        new_name = category_data["name"]
        # Check uniqueness (allow same name as current category)
        existing_cats = session.exec(
            select(Category)
            .where(
                (Category.name == new_name) & (Category.id != category_id)
            )
        ).all()
        if existing_cats:
            raise HTTPException(
                status_code=409,
                detail="Category with this name already exists"
            )
        updates["name"] = new_name

    if "color_hex" in category_data:
        updates["color_hex"] = category_data["color_hex"]

    if "icon_slug" in category_data:
        updates["icon_slug"] = category_data["icon_slug"]

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No valid fields to update"
        )

    # Apply updates
    for key, value in updates.items():
        setattr(category, key, value)

    session.add(category)
    session.commit()
    session.refresh(category)

    return {
        "category": {
            "id": category.id,
            "name": category.name,
            "parent_id": category.parent_id,
            "icon_slug": category.icon_slug,
            "color_hex": category.color_hex,
            "created_at": category.created_at.isoformat(),
        }
    }


@router.patch("/categories/{category_id}", tags=["Categories"])
def patch_category(category_id: str, category_data: dict, session: Session = Depends(get_db)):
    # Fetch existing category
    category = session.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check that we have at least one field to update
    if not category_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    # Extract and validate fields
    updates = {}

    if "name" in category_data:
        new_name = category_data["name"]
        # Check uniqueness (allow same name as current category)
        existing_cats = session.exec(
            select(Category)
            .where(
                (Category.name == new_name) & (Category.id != category_id)
            )
        ).all()
        if existing_cats:
            raise HTTPException(
                status_code=409,
                detail="Category with this name already exists"
            )
        updates["name"] = new_name

    if "color_hex" in category_data:
        updates["color_hex"] = category_data["color_hex"]

    if "icon_slug" in category_data:
        updates["icon_slug"] = category_data["icon_slug"]

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No valid fields to update"
        )

    # Apply updates
    for key, value in updates.items():
        setattr(category, key, value)

    session.add(category)
    session.commit()
    session.refresh(category)

    return {
        "category": {
            "id": category.id,
            "name": category.name,
            "parent_id": category.parent_id,
            "icon_slug": category.icon_slug,
            "color_hex": category.color_hex,
            "created_at": category.created_at.isoformat(),
        }
    }


@router.delete("/categories/{category_id}", tags=["Categories"])
def delete_category(category_id: str, session: Session = Depends(get_db)):
    # Fetch category
    category = session.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if category has subcategories
    subcategories = session.exec(
        select(Category).where(Category.parent_id == category_id)
    ).all()

    if subcategories:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete category with {len(subcategories)} subcategory/categor(ies). Delete child categories first."
        )

    # CASCADE DELETE in DB handles transactions automatically
    session.delete(category)
    session.commit()

    return {"message": "Category deleted successfully (associated transactions auto-unlinked)"}


@router.get("/transactions", tags=["Transactions"])
def list_transactions(
    account_id: str | None = Query(default=None),
    category_id: str | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    session: Session = Depends(get_db),
):
    # Build base query with filters
    query = select(Transaction)

    if account_id:
        query = query.where(Transaction.account_id == account_id)
    if category_id:
        query = query.where(Transaction.category_id == category_id)
    if start_date:
        query = query.where(Transaction.date >= start_date)
    if end_date:
        query = query.where(Transaction.date <= end_date)

    transactions = session.exec(query.order_by(Transaction.date.desc())).all()

    # Fetch category names for batch lookup
    category_names = {}
    if transactions:
        category_ids = list(set(t.category_id for t in transactions if t.category_id))
        if category_ids:
            cats_result = session.exec(
                select(Category).where(Category.id.in_(category_ids))
            ).all()
            category_names = {c.id: c.name for c in cats_result}

    return {
        "transactions": [
            {
                "id": transaction.id,
                "account_id": transaction.account_id,
                "date": transaction.date.isoformat(),
                "amount": str(transaction.amount),
                "description": transaction.description,
                "merchant_name": transaction.merchant_name,
                "category_id": transaction.category_id,
                "category_name": category_names.get(transaction.category_id),
                "notes": transaction.notes,
            }
            for transaction in transactions
        ]
    }


@router.post("/transactions", tags=["Transactions"])
def create_transaction(transaction: Transaction, session: Session = Depends(get_db)):
    db_transaction = Transaction(
        id=transaction.id or str(uuid4()),
        account_id=transaction.account_id,
        date=transaction.date,
        amount=transaction.amount,
        description=transaction.description,
        merchant_name=transaction.merchant_name,
        category_id=transaction.category_id,
        notes=transaction.notes,
    )
    session.add(db_transaction)
    session.commit()
    session.refresh(db_transaction)

    return {
        "transaction": {
            "id": db_transaction.id,
            "account_id": db_transaction.account_id,
            "date": db_transaction.date.isoformat(),
            "amount": str(db_transaction.amount),
            "description": db_transaction.description,
        }
    }


@router.delete("/transactions/{transaction_id}", tags=["Transactions"])
def delete_transaction(transaction_id: str, session: Session = Depends(get_db)):
    transaction = session.get(Transaction, transaction_id)
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")

    session.delete(transaction)
    session.commit()
    return {"message": "Transaction deleted successfully"}
