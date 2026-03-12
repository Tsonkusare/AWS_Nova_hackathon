"""
Batch Bill PDF Parser
======================
Reads every PDF in a folder and generates SQL inserts for section_text.

Usage:
    python parse_bills.py

Put all your downloaded bill PDFs in a folder called 'bills' 
in the same directory as this script.

Requirements:
    pip install pdfplumber --user
"""

import os
import re
import pdfplumber

BILLS_FOLDER = "bills_US_2"  # folder containing all your PDFs
OUTPUT_FILE  = "section_text_alltwo.sql"

def escape_sql(text: str) -> str:
    return text.replace("'", "''")

def clean(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a PDF file."""
    text_parts = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
    except Exception as e:
        print(f"  ERROR reading {pdf_path}: {e}")
        return ""
    return clean(" ".join(text_parts))

def guess_bill_number(filename: str, text: str) -> str:
    """
    Try to extract the bill number from:
    1. The filename  e.g. TX_HB4908.pdf -> H 4908
    2. The text content  e.g. "H.B. No. 4908" or "SENATE BILL 121"
    """
    # Try filename first — strip extension and clean up
    name = os.path.splitext(filename)[0]
    name = name.replace("_", " ").replace("-", " ")

    # Pattern: two letters + space + number e.g. HB 4908, SB 121
    match = re.search(r'\b([A-Z]{1,3})\s*(\d+)\b', name)
    if match:
        return f"{match.group(1)} {match.group(2)}"

    # Try from text content — common bill number formats
    patterns = [
        r'(?:H\.?B\.?|A\.?B\.?|HOUSE BILL)\s*(?:No\.?)?\s*(\d+)',
        r'(?:S\.?B\.?|SENATE BILL)\s*(?:No\.?)?\s*(\d+)',
        r'(?:H\.?R\.?|HOUSE RESOLUTION)\s*(?:No\.?)?\s*(\d+)',
        r'(?:S\.?R\.?|SENATE RESOLUTION)\s*(?:No\.?)?\s*(\d+)',
        r'(?:H\.?J\.?R\.?|HJR)\s*(?:No\.?)?\s*(\d+)',
        r'(?:S\.?J\.?R\.?|SJR)\s*(?:No\.?)?\s*(\d+)',
        r'\b([A-Z]{1,3})\s+(\d{2,5})\b',
    ]

    for pattern in patterns:
        match = re.search(pattern, text[:500], re.IGNORECASE)
        if match:
            groups = match.groups()
            if len(groups) == 1:
                return groups[0]
            return f"{groups[0]} {groups[1]}"

    # Fallback: use filename as-is
    return name

def guess_state(filename: str, text: str) -> str:
    """Try to guess the state from filename or bill text."""
    states = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California",
        "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
        "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
        "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
        "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
        "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
        "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
        "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
        "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
        "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
        "Puerto Rico",
    ]

    # Check filename
    name_lower = filename.lower()
    for state in states:
        if state.lower().replace(" ", "_") in name_lower.replace(" ", "_"):
            return state
        if state.lower()[:4] in name_lower[:6]:
            return state

    # Check first 300 chars of text
    text_start = text[:300]
    for state in states:
        if state.upper() in text_start.upper():
            return state

    # State abbreviation map
    abbrev = {
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
    for ab, full in abbrev.items():
        if filename.upper().startswith(ab + "_") or filename.upper().startswith(ab + "-"):
            return full

    return "Unknown"

def main():
    # Check bills folder exists
    if not os.path.isdir(BILLS_FOLDER):
        print(f"ERROR: Folder '{BILLS_FOLDER}' not found.")
        print(f"Create a folder called '{BILLS_FOLDER}' and put your PDF bills inside it.")
        return

    pdf_files = [f for f in os.listdir(BILLS_FOLDER) if f.lower().endswith(".pdf")]

    if not pdf_files:
        print(f"No PDF files found in '{BILLS_FOLDER}' folder.")
        return

    print(f"Found {len(pdf_files)} PDF files in '{BILLS_FOLDER}'\n")

    sql_lines = [
        "-- ============================================================",
        "-- Auto-generated section_text inserts from batch PDF parser",
        "-- ============================================================\n",
    ]

    success = 0
    failed  = 0

    for i, filename in enumerate(sorted(pdf_files)):
        path = os.path.join(BILLS_FOLDER, filename)
        print(f"[{i+1}/{len(pdf_files)}] {filename}", end=" ... ")

        # Extract text
        text = extract_text_from_pdf(path)
        if not text:
            print("FAILED (no text extracted)")
            failed += 1
            continue

        # Guess bill number and state
        bill_number = guess_bill_number(filename, text)
        state       = guess_state(filename, text)

        print(f"OK — {state} | {bill_number} | {len(text)} chars")

        bill_num_sql = escape_sql(bill_number)
        text_sql     = escape_sql(text)

        sql_lines.append(f"-- {state} | {bill_number} | {filename}")
        sql_lines.append("INSERT INTO section_text (section_id, language, text) VALUES (")
        sql_lines.append(f"  (SELECT section_id FROM sections WHERE section_number = '{bill_num_sql}'),")
        sql_lines.append(f"  'en',")
        sql_lines.append(f"  '{text_sql}'")
        sql_lines.append(");\n")
        success += 1

    # Write output
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))

    print(f"\n{'='*50}")
    print(f"Done!")
    print(f"  Processed: {success} bills")
    print(f"  Failed:    {failed} bills")
    print(f"  Output:    {OUTPUT_FILE}")
    print(f"{'='*50}")
    print(f"\nTip: If bill numbers were guessed wrong, rename your PDF files")
    print(f"like this:  TX_H4908.pdf  or  NY_A3719.pdf")
    print(f"and run the script again.")

if __name__ == "__main__":
    main()