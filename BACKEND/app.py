from fastapi import FastAPI

from routes.project_routes import router as project_router
from routes.regulation_routes import router as regulation_router

app = FastAPI(title="AI Regulation Copilot API")

app.include_router(project_router)
app.include_router(regulation_router)


@app.get("/")
def root():
    return {"message": "AI Regulation Copilot backend is running"}