"""
Initialize all database tables and seed regulation data from bill cache.
"""

import os
import json

from db.connection import engine, Base, SessionLocal
from models.project import Project, UploadedFile
from models.analysis import Analysis
from models.regulation import Country, Regulation, Section, SectionText


def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
    print("[InitDB] All tables created")


def seed_regulations():
    """Load bill data from cache into the regulations tables."""
    cache_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data", "bills_cache.json"
    )

    if not os.path.exists(cache_path):
        print("[InitDB] No bill cache found — skipping seed")
        return

    db = SessionLocal()
    try:
        # Check if already seeded
        count = db.query(Regulation).count()
        if count > 0:
            print(f"[InitDB] Regulations already seeded ({count} records)")
            return

        with open(cache_path, "r", encoding="utf-8") as f:
            bills = json.load(f)

        # Build jurisdiction lookup
        jurisdictions = {}
        for bill in bills:
            j = bill["jurisdiction"]
            if j not in jurisdictions:
                jtype = "eu" if bill.get("type") == "eu" else "us_state"
                country = Country(name=j, type=jtype)
                db.add(country)
                db.flush()
                jurisdictions[j] = country.jurisdiction_id

        # Insert regulations with sections
        for bill in bills:
            reg = Regulation(
                jurisdiction_id=jurisdictions[bill["jurisdiction"]],
                title=bill.get("bill_number") or bill.get("filename", "Unknown"),
                year=bill.get("year"),
                status="active",
            )
            db.add(reg)
            db.flush()

            section = Section(
                reg_id=reg.reg_id,
                section_number="full_text",
                section_title=bill.get("bill_number", "Full Text"),
            )
            db.add(section)
            db.flush()

            section_text = SectionText(
                section_id=section.section_id,
                language="en",
                text=bill.get("text", "")[:50000],  # cap at 50k chars
            )
            db.add(section_text)

        db.commit()
        print(f"[InitDB] Seeded {len(bills)} regulations from bill cache")

    except Exception as e:
        db.rollback()
        print(f"[InitDB] Seed error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    seed_regulations()
    print("Done.")
