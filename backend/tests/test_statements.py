import io
from datetime import date
from decimal import Decimal
from unittest.mock import patch
import pypdf
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.models import Account, AccountType, Statement, Transaction, get_db
from app.routers.api import router
from app.services.pdf_parser import parse_statement_text, parse_date_string, extract_period_dates


def create_sample_pdf() -> bytes:
    """Utility to construct a simple PDF in memory using pypdf."""
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=612, height=792)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def test_parse_date_string():
    assert parse_date_string("07/15/2026") == date(2026, 7, 15)
    assert parse_date_string("2026-07-15") == date(2026, 7, 15)
    assert parse_date_string("Jul 15, 2026") == date(2026, 7, 15)


def test_parse_statement_text():
    sample_text = """
    Account Statement Period: 07/01/2026 to 07/31/2026
    
    07/02/2026 GROCERY STORE -$45.50
    07/10/2026 PAYCHECK DIRECT DEPOSIT $1500.00
    07/15/2026 COFFEE SHOP 4.25 CR
    """
    result = parse_statement_text(sample_text)
    
    assert result["period_start_date"] == date(2026, 7, 1)
    assert result["period_end_date"] == date(2026, 7, 31)
    assert len(result["transactions"]) == 3
    
    tx1 = result["transactions"][0]
    assert tx1["date"] == date(2026, 7, 2)
    assert tx1["amount"] == Decimal("-45.50")
    
    tx2 = result["transactions"][1]
    assert tx2["date"] == date(2026, 7, 10)
    assert tx2["amount"] == Decimal("1500.00")


def test_statement_api_flow():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    SQLModel.metadata.create_all(engine)

    app = FastAPI()
    app.include_router(router, prefix="/v1")

    def override_get_db():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    # 1. Create target account
    acc_res = client.post("/v1/api/accounts", json={
        "name": "Checking Account",
        "institution": "Test Bank",
        "account_type": "checking",
        "currency": "USD"
    })
    assert acc_res.status_code == 200
    acc_id = acc_res.json()["account"]["id"]

    # 2. Upload statement (with mocked PDF text extraction)
    mock_text = """
    Account Statement Period: 07/01/2026 to 07/31/2026
    07/05/2026 SUPERMARKET -$82.40
    07/12/2026 FREELANCE PAY $600.00
    """
    with patch("app.routers.api.extract_text_from_pdf", return_value=mock_text):
        pdf_bytes = create_sample_pdf()
        upload_res = client.post(
            "/v1/api/statements/upload",
            data={"account_id": acc_id},
            files={"file": ("july_statement.pdf", pdf_bytes, "application/pdf")}
        )
        assert upload_res.status_code == 200, upload_res.text
        data = upload_res.json()
        stmt_id = data["statement"]["id"]
        assert data["created_transactions_count"] == 2
        assert data["statement"]["account_id"] == acc_id

    # 3. List statements
    stmt_list_res = client.get(f"/v1/api/statements?account_id={acc_id}")
    assert stmt_list_res.status_code == 200
    stmts = stmt_list_res.json()["statements"]
    assert len(stmts) == 1
    assert stmts[0]["id"] == stmt_id

    # 4. List transactions filtered by statement_id
    tx_list_res = client.get(f"/v1/api/transactions?statement_id={stmt_id}")
    assert tx_list_res.status_code == 200
    txs = tx_list_res.json()["transactions"]
    assert len(txs) == 2
    assert txs[0]["statement_id"] == stmt_id

    # 5. Delete statement
    del_res = client.delete(f"/v1/api/statements/{stmt_id}")
    assert del_res.status_code == 200
