"""
Bill browsing routes — serves regulation data directly from PDFs on disk.
No database required.
"""

from typing import Optional

from fastapi import APIRouter, Query
from services.bill_loader import bill_store

router = APIRouter(prefix="/bills", tags=["Bills"])


@router.get("/")
def list_bills(
    jurisdiction: Optional[str] = Query(default=None, description="Filter by state/jurisdiction name"),
    limit: int = Query(default=50, le=200),
):
    """List all available bills from the PDF collection."""
    return bill_store.list_all(jurisdiction=jurisdiction, limit=limit)


@router.get("/search")
def search_bills(
    q: str = Query(..., description="Search query (keywords)"),
    jurisdiction: Optional[str] = Query(default=None),
    limit: int = Query(default=10, le=50),
):
    """Search bills by keyword — returns matching snippets from actual bill text."""
    return bill_store.search(query=q, jurisdiction=jurisdiction, limit=limit)


@router.get("/jurisdictions")
def list_jurisdictions():
    """List all unique jurisdictions (states/countries) in the bill collection."""
    if not bill_store._loaded:
        bill_store.load()

    jurisdictions = set()
    for bill in bill_store.bills:
        jurisdictions.add(bill["jurisdiction"])

    return sorted(jurisdictions)


@router.get("/stats")
def bill_stats():
    """Get statistics about the loaded bill collection."""
    if not bill_store._loaded:
        bill_store.load()

    by_jurisdiction = {}
    by_type = {"us_state": 0, "eu": 0}
    by_year = {}

    for bill in bill_store.bills:
        j = bill["jurisdiction"]
        by_jurisdiction[j] = by_jurisdiction.get(j, 0) + 1
        by_type[bill["type"]] = by_type.get(bill["type"], 0) + 1
        if bill["year"]:
            y = str(bill["year"])
            by_year[y] = by_year.get(y, 0) + 1

    return {
        "total_bills": len(bill_store.bills),
        "by_jurisdiction": by_jurisdiction,
        "by_type": by_type,
        "by_year": by_year,
    }
