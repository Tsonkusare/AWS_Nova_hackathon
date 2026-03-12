from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.connection import get_db
from models.project import Project
from schemas.project_schema import ProjectCreate, ProjectResponse, AnalysisResponse
from services.analysis_service import analyze_project_with_nova, save_analysis

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse)
def create_project(project_data: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        name=project_data.name,
        industry=project_data.industry,
        region=project_data.region,
        use_case=project_data.use_case,
        description=project_data.description,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/{project_id}/analyze", response_model=AnalysisResponse)
def analyze_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    analysis_data = analyze_project_with_nova(project)
    save_analysis(db, project_id, analysis_data)

    return AnalysisResponse(
        project_id=project_id,
        frameworks=analysis_data["frameworks"],
        risk_level=analysis_data["risk_level"],
        concerns=analysis_data["concerns"],
        next_actions=analysis_data["next_actions"],
        rationale=analysis_data["rationale"],
    )