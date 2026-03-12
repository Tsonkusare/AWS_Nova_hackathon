from db.connection import engine, Base

from models.project import Project, UploadedFile
from models.regulation import Regulation, RegulationSection, ComplianceRequirement
from models.analysis import Analysis


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database tables created successfully.")