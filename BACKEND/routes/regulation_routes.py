from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from db.connection import get_db

router = APIRouter(prefix="/regulations", tags=["Regulations"])


@router.get("/")
def list_regulations(
    jurisdiction: str | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
):
    query = """
        SELECT
            r.reg_id,
            r.title,
            r.year,
            r.status,
            r.effective_date,
            c.name AS jurisdiction_name,
            c.type AS jurisdiction_type
        FROM regulations r
        LEFT JOIN country c
            ON r.jurisdiction_id = c.jurisdiction_id
        WHERE 1=1
    """

    params = {}

    if jurisdiction:
        query += " AND c.name ILIKE :jurisdiction"
        params["jurisdiction"] = f"%{jurisdiction}%"

    if status:
        query += " AND r.status ILIKE :status"
        params["status"] = status

    query += " ORDER BY r.year DESC NULLS LAST, r.reg_id DESC LIMIT :limit"
    params["limit"] = limit

    result = db.execute(text(query), params).fetchall()
    return [dict(row._mapping) for row in result]