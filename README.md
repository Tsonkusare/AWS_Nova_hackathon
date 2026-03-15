# AI Compliance Advisor

A generative AI application using Amazon Nova on AWS that audits AI-generated content for compliance risks. Users can paste text, upload documents, or use voice input to submit content for analysis. The AI advisor provides risk levels, identifies violations, and suggests fixes in the user's selected language.

## Tech Stack

- **Frontend**: React + Tailwind CSS + Vite + TypeScript
- **Backend**: TBD (Amazon Nova via AWS Bedrock)
- **AI Model**: Amazon Nova (Nova 2 Lite / Nova 2 Sonic)

## Project Structure

```
frontend/       # React frontend application
backend/        # Backend API (TBD)
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
TBD

## Uncommitted Changes — Backend

### Modified Files

- **`BACKEND/app.py`** — Added routers for analyze, generate, regulation, and bill routes; startup DB init and bill cache loading
- **`BACKEND/config.py`** — Updated configuration settings
- **`BACKEND/db/connection.py`** — Updated database connection setup
- **`BACKEND/db/init_db.py`** — Expanded DB initialization with table creation and regulation seeding
- **`BACKEND/models/analysis.py`** — Updated analysis model fields
- **`BACKEND/routes/regulation_routes.py`** — Updated regulation endpoints
- **`BACKEND/.env`** — Updated environment variables

### New Files

- **`BACKEND/routes/analyze_routes.py`** — Text and file analysis endpoints
- **`BACKEND/routes/bill_routes.py`** — Bill listing and search endpoints
- **`BACKEND/routes/generate_routes.py`** — Text generation endpoint
- **`BACKEND/services/bill_loader.py`** — Bill data loader service
- **`BACKEND/data/bills_cache.json`** — Cached bill data (136 bills)
- **`BACKEND/data/copilot.db`** — SQLite database

## Team Work Log

See individual logs:
- [Frontend Log](./FRONTEND.md)
- [Backend Log](./BACKEND.md)
