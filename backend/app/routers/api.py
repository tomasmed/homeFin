from datetime import date, datetime
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlmodel import Session, SQLModel, select

from app.models import (
    Account,
    Category,
    CategoryInput,
    Statement,
    Transaction,
    engine,
    get_db,
    seed_categories,
)
from app.services.pdf_parser import extract_text_from_pdf, parse_statement_text

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
    # Check if category with this name already exists
    existing_name = session.exec(select(Category.name).where(Category.name == category.name)).first()
    if existing_name:
        raise HTTPException(
            status_code=409,
            detail=f"Category with name '{category.name}' already exists"
        )
    
    # Generate unique color if not provided
    if not category.color_hex:
        from secrets import token_hex
        # Generate a random 6-char hex color
        color_hex = "#" + token_hex(3)
    else:
        color_hex = category.color_hex
    
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

    try:
        session.add(db_category)
        session.commit()
        session.refresh(db_category)
    except Exception as e:
        session.rollback()
        logger.error(f"Error creating category {category.name}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create category: {str(e)}")
    
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
    statement_id: str | None = Query(default=None),
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
    if statement_id:
        query = query.where(Transaction.statement_id == statement_id)
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
                "statement_id": transaction.statement_id,
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


@router.get("/statements", tags=["Statements"])
def list_statements(
    account_id: str | None = Query(default=None),
    session: Session = Depends(get_db),
):
    query = select(Statement)
    if account_id:
        query = query.where(Statement.account_id == account_id)

    statements = session.exec(query.order_by(Statement.upload_date.desc())).all()
    return {
        "statements": [
            {
                "id": stmt.id,
                "account_id": stmt.account_id,
                "filename": stmt.filename,
                "upload_date": stmt.upload_date.isoformat(),
                "period_start_date": stmt.period_start_date.isoformat() if stmt.period_start_date else None,
                "period_end_date": stmt.period_end_date.isoformat() if stmt.period_end_date else None,
                "transaction_count": stmt.transaction_count,
            }
            for stmt in statements
        ]
    }


@router.get("/statements/{statement_id}", tags=["Statements"])
def get_statement(statement_id: str, session: Session = Depends(get_db)):
    statement = session.get(Statement, statement_id)
    if statement is None:
        raise HTTPException(status_code=404, detail="Statement not found")

    return {
        "statement": {
            "id": statement.id,
            "account_id": statement.account_id,
            "filename": statement.filename,
            "upload_date": statement.upload_date.isoformat(),
            "period_start_date": statement.period_start_date.isoformat() if statement.period_start_date else None,
            "period_end_date": statement.period_end_date.isoformat() if statement.period_end_date else None,
            "transaction_count": statement.transaction_count,
        }
    }


@router.post("/statements/upload", tags=["Statements"])
async def upload_statement(
    account_id: str = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_db),
):
    account = session.get(Account, account_id)
    if account is None:
        raise HTTPException(status_code=404, detail="Target account not found")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()
    try:
        raw_text = extract_text_from_pdf(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract readable text from PDF file")

    parsed = parse_statement_text(raw_text)
    parsed_txs = parsed["transactions"]

    db_statement = Statement(
        id=str(uuid4()),
        account_id=account_id,
        filename=file.filename,
        period_start_date=parsed["period_start_date"],
        period_end_date=parsed["period_end_date"],
        transaction_count=len(parsed_txs),
        raw_text=parsed["raw_text"],
    )
    session.add(db_statement)

    created_tx_objs = []
    for tx in parsed_txs:
        db_tx = Transaction(
            id=str(uuid4()),
            account_id=account_id,
            statement_id=db_statement.id,
            date=tx["date"],
            amount=tx["amount"],
            description=tx["description"],
            merchant_name=tx["merchant_name"],
            notes=tx["notes"],
        )
        session.add(db_tx)
        created_tx_objs.append(db_tx)

    session.commit()
    session.refresh(db_statement)

    return {
        "statement": {
            "id": db_statement.id,
            "account_id": db_statement.account_id,
            "filename": db_statement.filename,
            "upload_date": db_statement.upload_date.isoformat(),
            "period_start_date": db_statement.period_start_date.isoformat() if db_statement.period_start_date else None,
            "period_end_date": db_statement.period_end_date.isoformat() if db_statement.period_end_date else None,
            "transaction_count": db_statement.transaction_count,
        },
        "created_transactions_count": len(created_tx_objs),
    }


@router.delete("/statements/{statement_id}", tags=["Statements"])
def delete_statement(statement_id: str, session: Session = Depends(get_db)):
    statement = session.get(Statement, statement_id)
    if statement is None:
        raise HTTPException(status_code=404, detail="Statement not found")

    session.delete(statement)
    session.commit()
    return {"message": "Statement deleted successfully"}

