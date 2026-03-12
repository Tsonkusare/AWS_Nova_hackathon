from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


class ProjectCreate(BaseModel):
    name: str
    industry: Optional[str] = None
    region: Optional[str] = None
    use_case: Optional[str] = None
    description: Optional[str] = None


class UploadedFileResponse(BaseModel):
    id: int
    filename: str
    s3_key: Optional[str] = None
    content_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectResponse(BaseModel):
    id: int
    name: str
    industry: Optional[str] = None
    region: Optional[str] = None
    use_case: Optional[str] = None
    description: Optional[str] = None
    uploaded_files: List[UploadedFileResponse] = []

    model_config = ConfigDict(from_attributes=True)


class AnalysisResponse(BaseModel):
    project_id: int
    frameworks: List[str]
    risk_level: str
    concerns: List[str]
    next_actions: List[str]
    rationale: str