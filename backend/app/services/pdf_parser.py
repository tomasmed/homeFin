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


def parse_date_string(date_str: str, default_year: Optional[int] = None) -> Optional[date]:
    """Parse common statement date strings into datetime.date."""
    date_str = date_str.strip()
    
    # Check for short date MM/DD format
    short_match = re.match(r"^(\d{1,2})[/-](\d{1,2})$", date_str)
    if short_match:
        m, d = int(short_match.group(1)), int(short_match.group(2))
        year_to_use = default_year or datetime.now().year
        try:
            return date(year_to_use, m, d)
        except ValueError:
            return None

    formats = [
        "%m/%d/%Y",
        "%m/%d/%y",
        "%Y-%m-%d",
        "%m-%d-%Y",
        "%b %d, %Y",
        "%b %d %Y",
        "%d %b %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None


def extract_period_dates(raw_text: str) -> tuple[Optional[date], Optional[date]]:
    """Extract overall statement period start and end dates from header text."""
    # Pattern 1: e.g. "01/17/26 to 02/13/26" or "01/17/2026 to 02/13/2026"
    p1 = re.compile(
        r"(\d{1,2}/\d{1,2}/\d{2,4})\s*(?:to|-|through)\s*(\d{1,2}/\d{1,2}/\d{2,4})",
        re.IGNORECASE,
    )
    match1 = p1.search(raw_text)
    if match1:
        start_d = parse_date_string(match1.group(1))
        end_d = parse_date_string(match1.group(2))
        if start_d and end_d:
            return start_d, end_d

    # Pattern 2: e.g. "Statement Period: 07/01/2026 to 07/31/2026"
    p2 = re.compile(
        r"(?:period|statement period|date range)[:\s]*(\d{1,2}/\d{1,2}/\d{2,4}|\d{4}-\d{2}-\d{2})\s*(?:to|-|through)\s*(\d{1,2}/\d{1,2}/\d{2,4}|\d{4}-\d{2}-\d{2})",
        re.IGNORECASE,
    )
    match2 = p2.search(raw_text)
    if match2:
        start_d = parse_date_string(match2.group(1))
        end_d = parse_date_string(match2.group(2))
        if start_d and end_d:
            return start_d, end_d

    return None, None


def parse_statement_text(raw_text: str) -> Dict[str, Any]:
    """
    Parse statement raw text into structured transaction records and statement period dates.
    Supports multi-format bank statements (Chase, Huntington, Bank of America, Wells Fargo, Amex).
    """
    lines = raw_text.splitlines()
    transactions: List[Dict[str, Any]] = []

    start_date, end_date = extract_period_dates(raw_text)
    statement_year = start_date.year if start_date else datetime.now().year

    current_section = 'general'  # 'credit', 'debit', 'ignore', 'general'
    pending_extra_desc = ""

    # Common line regexes:
    # Pattern A: MM/DD/YYYY or MM/DD/YY or MM/DD followed by description followed by amount
    pattern_date_prefix = re.compile(
        r"^(\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?|\d{4}-\d{2}-\d{2}|[A-Za-z]{3}\s+\d{1,2}(?:,\s*|\s+)\d{4})\s+(.+?)\s+([+-]?\$?\s*-?\d+(?:,\d{3})*\.\d{2}(?:\s*(?:CR|DR|-|\+))?)$",
        re.IGNORECASE,
    )

    # Pattern B: Alternative format with trailing amount
    pattern_alt = re.compile(
        r"^(\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?)\s+(.+?)\s+([+-]?\$?\s*\d+\.\d{2})$",
        re.IGNORECASE,
    )

    for line in lines:
        l = line.strip()
        if not l:
            continue

        l_lower = l.lower()

        # Detect section headings
        if (("deposit" in l_lower or "credit" in l_lower) and ("activity" in l_lower or "summary" in l_lower)) or l_lower.startswith("deposits") or l_lower.startswith("additions"):
            current_section = 'credit'
            pending_extra_desc = ""
            continue
        elif (("withdrawal" in l_lower or "debit" in l_lower) and ("activity" in l_lower or "summary" in l_lower)) or l_lower.startswith("withdrawals") or l_lower.startswith("subtractions") or l_lower.startswith("checks paid"):
            current_section = 'debit'
            pending_extra_desc = ""
            continue
        elif "balance activity" in l_lower or "privacy notice" in l_lower or "balancing your statement" in l_lower or "statement activity from" in l_lower:
            current_section = 'ignore'
            pending_extra_desc = ""
            continue

        if current_section == 'ignore' or re.search(r"statement period|\bdate range\b", l_lower):
            continue

        match = pattern_date_prefix.match(l) or pattern_alt.match(l)
        if match:
            raw_d, raw_desc, raw_amount = match.groups()

            if pending_extra_desc:
                raw_desc = pending_extra_desc + " " + raw_desc
                pending_extra_desc = ""

            parsed_d = parse_date_string(raw_d, default_year=statement_year)
            if not parsed_d:
                continue

            # Clean amount
            clean_amt = raw_amount.replace("$", "").replace(",", "").strip()
            is_negative = False
            if clean_amt.endswith("CR") or clean_amt.endswith("-") or clean_amt.startswith("-"):
                is_negative = True
                clean_amt = clean_amt.replace("CR", "").replace("-", "").strip()
            elif clean_amt.endswith("DR") or clean_amt.startswith("+"):
                clean_amt = clean_amt.replace("DR", "").replace("+", "").strip()
            elif current_section == 'debit':
                is_negative = True

            try:
                val = Decimal(clean_amt)
                if is_negative and val > 0:
                    val = -val
                elif not is_negative and current_section == 'credit' and val < 0:
                    val = abs(val)
            except Exception:
                continue

            desc = raw_desc.strip()
            merchant = desc.split("  ")[0].strip() if "  " in desc else desc

            transactions.append({
                "date": parsed_d,
                "description": desc,
                "amount": val,
                "merchant_name": merchant[:255] if merchant else None,
                "notes": f"Imported from PDF statement line: {l[:100]}",
            })
        else:
            # Accumulate potential wrapped multiline transaction descriptions only inside credit/debit sections
            if current_section in ('credit', 'debit') and not l.startswith("Date") and not l.startswith("Page"):
                if not re.match(r"^(\d{1,2}[-/]\d{1,2})", l):
                    pending_extra_desc += " " + l
            else:
                pending_extra_desc = ""

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
        "diagnostics": {
            "total_lines": len(lines),
            "parsed_count": len(transactions),
            "period_start": start_date.isoformat() if start_date else None,
            "period_end": end_date.isoformat() if end_date else None,
        }
    }
