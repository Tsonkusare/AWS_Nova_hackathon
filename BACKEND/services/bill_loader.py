"""
Bill Loader Service
====================
Reads bill PDFs and caches extracted text as JSON for instant loading.
First run extracts from PDFs (~60s), subsequent runs load from cache (<1s).
"""

import os
import re
import json
from typing import Optional

_BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_FILE = os.path.join(_BASE, "data", "bills_cache.json")

BILL_DIRS = [
    os.path.join(_BASE, "data", "bills", "bills_us"),
    os.path.join(_BASE, "data", "bills", "bills_eu"),
    os.path.join(os.path.dirname(_BASE), "bills_US_2"),
]

STATE_ABBREV = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming", "PR": "Puerto Rico",
}


def _parse_filename(filename: str) -> dict:
    info = {"filename": filename, "jurisdiction": "Unknown", "bill_number": "", "year": None, "type": "us_state"}

    year_match = re.search(r'\((\d{4})\)', filename)
    if year_match:
        info["year"] = int(year_match.group(1))

    bill_match = re.search(r'\b([A-Z]{2})\s+([A-Z]+)\s+(\d+)', filename)
    if bill_match:
        state_abbr = bill_match.group(1)
        info["jurisdiction"] = STATE_ABBREV.get(state_abbr, state_abbr)
        info["bill_number"] = f"{bill_match.group(2)} {bill_match.group(3)}"

    if "GDPR" in filename.upper():
        info["jurisdiction"] = "European Union"
        info["bill_number"] = "GDPR"
        info["type"] = "eu"
    elif "OJ_L" in filename or "202401689" in filename:
        info["jurisdiction"] = "European Union"
        info["bill_number"] = "EU AI Act"
        info["type"] = "eu"
    elif "SPANISH" in filename.upper():
        info["jurisdiction"] = "European Union"
        info["type"] = "eu"
        if "GDPR" in filename.upper():
            info["bill_number"] = "GDPR (Spanish)"
        else:
            info["bill_number"] = "EU AI Act (Spanish)"

    return info


def _extract_from_pdfs() -> list:
    """Read all PDFs and return bill data. Slow (~60s)."""
    import pdfplumber

    bills = []
    seen = set()
    for bill_dir in BILL_DIRS:
        if not os.path.isdir(bill_dir):
            continue
        pdfs = [f for f in os.listdir(bill_dir) if f.lower().endswith(".pdf")]
        print(f"[BillLoader] Reading {len(pdfs)} PDFs from {bill_dir}")
        for filename in sorted(pdfs):
            if filename in seen:
                continue
            seen.add(filename)
            path = os.path.join(bill_dir, filename)
            try:
                text_parts = []
                with pdfplumber.open(path) as pdf:
                    for page in pdf.pages:
                        t = page.extract_text()
                        if t:
                            text_parts.append(t)
                text = re.sub(r'\s+', ' ', " ".join(text_parts)).strip()
                if not text:
                    continue
            except Exception as e:
                print(f"  ERROR: {filename}: {e}")
                continue

            info = _parse_filename(filename)
            info["text"] = text
            bills.append(info)
    return bills


def _save_cache(bills: list):
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(bills, f, ensure_ascii=False)
    print(f"[BillLoader] Cache saved: {CACHE_FILE}")


def _load_cache() -> list:
    with open(CACHE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


class BillStore:
    def __init__(self):
        self.bills: list = []
        self._loaded = False

    def load(self):
        if self._loaded:
            return

        # Try cache first (instant), fall back to PDF extraction (slow)
        if os.path.exists(CACHE_FILE):
            print("[BillLoader] Loading from cache...")
            self.bills = _load_cache()
            print(f"[BillLoader] Loaded {len(self.bills)} bills from cache")
        else:
            print("[BillLoader] No cache found — extracting from PDFs (first time only)...")
            self.bills = _extract_from_pdfs()
            _save_cache(self.bills)
            print(f"[BillLoader] Extracted and cached {len(self.bills)} bills")

        self._loaded = True

    def search(self, query: str, jurisdiction: Optional[str] = None, limit: int = 5) -> list:
        if not self._loaded:
            self.load()

        query_lower = query.lower()
        keywords = [w for w in query_lower.split() if len(w) > 3]
        if not keywords:
            return []

        results = []
        for bill in self.bills:
            if jurisdiction and jurisdiction.lower() not in bill["jurisdiction"].lower():
                continue
            text_lower = bill["text"].lower()
            score = sum(1 for kw in keywords if kw in text_lower)
            if score == 0:
                continue

            snippet = _find_snippet(bill["text"], keywords)
            results.append({
                "jurisdiction": bill["jurisdiction"],
                "bill_number": bill["bill_number"],
                "year": bill["year"],
                "type": bill["type"],
                "score": score,
                "snippet": snippet,
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]

    def list_all(self, jurisdiction: Optional[str] = None, limit: int = 50) -> list:
        if not self._loaded:
            self.load()

        results = []
        for bill in self.bills:
            if jurisdiction and jurisdiction.lower() not in bill["jurisdiction"].lower():
                continue
            results.append({
                "jurisdiction": bill["jurisdiction"],
                "bill_number": bill["bill_number"],
                "year": bill["year"],
                "type": bill["type"],
                "text_preview": bill["text"][:300],
            })
        return results[:limit]

    def get_relevant_context(self, text: str, limit: int = 3) -> str:
        if not self._loaded:
            self.load()

        domain_keywords = [
            "hiring", "employment", "resume", "candidate", "recruit",
            "healthcare", "health", "medical", "patient", "diagnosis",
            "finance", "loan", "credit", "banking", "insurance",
            "education", "student", "school", "learning",
            "surveillance", "facial", "recognition", "biometric",
            "discrimination", "bias", "fairness", "transparency",
            "privacy", "data", "personal", "consent", "gdpr",
            "criminal", "policing", "notification", "disclosure",
        ]
        important = [kw for kw in domain_keywords if kw in text.lower()]
        words = [w for w in text.lower().split() if len(w) > 4]
        query = " ".join(set(important + words[:10]))

        if not query.strip():
            return ""

        results = self.search(query, limit=limit)
        if not results:
            return ""

        return "\n\n".join(
            f"[{r['jurisdiction']} - {r['bill_number']}]: {r['snippet']}"
            for r in results
        )


def _find_snippet(text: str, keywords: list, window: int = 300) -> str:
    text_lower = text.lower()
    best_pos = 0
    best_score = 0
    for i in range(0, max(1, len(text_lower) - window), 100):
        chunk = text_lower[i:i + window]
        score = sum(1 for kw in keywords if kw in chunk)
        if score > best_score:
            best_score = score
            best_pos = i

    start = max(0, best_pos)
    end = min(len(text), start + window)
    snippet = text[start:end].strip()
    if start > 0:
        snippet = "..." + snippet
    if end < len(text):
        snippet = snippet + "..."
    return snippet


bill_store = BillStore()
