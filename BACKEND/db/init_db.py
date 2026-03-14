from db.connection import engine, Base

from models.project import Project, UploadedFile
from models.analysis import Analysis


def init_db():
    Base.metadata.create_all(
        bind=engine,
        tables=[
            Project.__table__,
            UploadedFile.__table__,
            Analysis.__table__,
        ],
    )


if __name__ == "__main__":
    init_db()
    print("App tables created successfully.")