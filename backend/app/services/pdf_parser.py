import io
import re
from datetime import datetime, date
from decimal import Decimal
from typing import List, Dict, Any, Optional
import pypdf


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract raw text content from uploaded PDF file bytes using pypdf."""
    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    extracted = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            extracted.append(text)
    return "\n".join(extracted)


def parse_date_string(date_str: str) -> Optional[date]:
    """Parse common statement date strings into datetime.date."""
    date_str = date_str.strip()
    formats = [
        "%m/%d/%Y",
        "%Y-%m-%d",
        "%m-%d-%Y",
        "%b %d, %Y",
        "%b %d %Y",
        "%d %b %Y",
        "%m/%d/%y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None


def extract_period_dates(raw_text: str) -> tuple[Optional[date], Optional[date]]:
    """Extract overall statement period start and end dates from header text."""
    period_pattern = re.compile(
        r"(?:period|statement period|date range)[:\s]*(\d{1,2}/\d{1,2}/\d{2,4}|\d{4}-\d{2}-\d{2})\s*(?:to|-|through)\s*(\d{1,2}/\d{1,2}/\d{2,4}|\d{4}-\d{2}-\d{2})",
        re.IGNORECASE,
    )
    match = period_pattern.search(raw_text)
    if match:
        start_d = parse_date_string(match.group(1))
        end_d = parse_date_string(match.group(2))
        return start_d, end_d
    return None, None


def parse_statement_text(raw_text: str) -> Dict[str, Any]:
    """
    Parse statement raw text into structured transaction records and statement period dates.
    """
    lines = raw_text.splitlines()
    transactions: List[Dict[str, Any]] = []

    # Common regex pattern for statement line:
    # 1. Date at start (e.g. 07/15/2026 or 2026-07-15 or Jul 15, 2026 or 07/15/26)
    # 2. Description in middle
    # 3. Amount at end (e.g. -45.50, $45.50, -$120.00, 100.00 CR, 100.00-)
    date_prefix_regex = re.compile(
        r"^(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}-\d{2}-\d{2}|[A-Za-z]{3}\s+\d{1,2}(?:,\s*|\s+)\d{4})\s+(.+?)\s+([+-]?\$?\s*-?\d{1,3}(?:,\d{3})*\.\d{2}(?:\s*(?:CR|DR|-|\+))?)$",
        re.IGNORECASE,
    )

    alt_regex = re.compile(
        r"^(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s+(.+?)\s+([+-]?\$?\s*\d+\.\d{2})$",
        re.IGNORECASE,
    )

    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue

        match = date_prefix_regex.match(line_str) or alt_regex.match(line_str)
        if match:
            raw_date, raw_desc, raw_amount = match.groups()
            parsed_date = parse_date_string(raw_date)
            if not parsed_date:
                continue

            # Clean amount string
            clean_amt = raw_amount.replace("$", "").replace(",", "").strip()
            is_negative = False
            if clean_amt.endswith("CR") or clean_amt.endswith("-") or clean_amt.startswith("-"):
                is_negative = True
                clean_amt = clean_amt.replace("CR", "").replace("-", "").strip()
            elif clean_amt.endswith("DR") or clean_amt.startswith("+"):
                clean_amt = clean_amt.replace("DR", "").replace("+", "").strip()

            try:
                val = Decimal(clean_amt)
                if is_negative and val > 0:
                    val = -val
            except Exception:
                continue

            desc = raw_desc.strip()
            merchant = desc.split("  ")[0].strip() if "  " in desc else desc

            transactions.append({
                "date": parsed_date,
                "description": desc,
                "amount": val,
                "merchant_name": merchant[:255] if merchant else None,
                "notes": f"Imported from PDF statement line: {line_str[:100]}",
            })

    start_date, end_date = extract_period_dates(raw_text)

    if transactions:
        tx_dates = [t["date"] for t in transactions]
        if not start_date:
            start_date = min(tx_dates)
        if not end_date:
            end_date = max(tx_dates)

    return {
        "period_start_date": start_date,
        "period_end_date": end_date,
        "transactions": transactions,
        "raw_text": raw_text[:10000],
    }
