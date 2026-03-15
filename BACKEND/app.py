import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.analyze_routes import router as analyze_router
from routes.generate_routes import router as generate_router
from routes.project_routes import router as project_router
from routes.regulation_routes import router as regulation_router
from routes.bill_routes import router as bill_router

app = FastAPI(title="AI Regulation Copilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(generate_router)
app.include_router(project_router)
app.include_router(regulation_router)
app.include_router(bill_router)


@app.on_event("startup")
def startup():
    """Initialize database tables and seed data."""
    from db.init_db import init_db, seed_regulations
    init_db()
    seed_regulations()

    # Load bill cache for search (instant from JSON)
    from services.bill_loader import bill_store
    bill_store.load()


@app.get("/")
def root():
    from services.bill_loader import bill_store
    return {
        "message": "AI Regulation Copilot backend is running",
        "bills_loaded": len(bill_store.bills),
    }
