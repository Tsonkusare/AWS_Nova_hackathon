# AI Regulation Copilot

AI Regulation Copilot is a hackathon project built for the Amazon Nova AI Hackathon. The app helps founders and teams quickly assess an AI product for likely governance and compliance risks using Amazon Nova on AWS.

The current implementation includes:
- a FastAPI backend
- PostgreSQL for project and analysis records
- Amazon Bedrock with Amazon Nova 2 Lite for compliance-style analysis
- Swagger UI for local API testing

## Current project status

The backend is working locally for the core flow:
1. create a project
2. retrieve a project
3. analyze the project with Amazon Nova

The regulation SQL dataset is still being normalized for PostgreSQL. The Nova-backed project analysis flow is the current priority and is the most stable path for demos.

## Backend features

Implemented endpoints:
- `GET /` – health check
- `POST /projects/` – create a project
- `GET /projects/{project_id}` – fetch a project
- `POST /projects/{project_id}/analyze` – run Amazon Nova analysis and save the result

## Tech stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** FastAPI + SQLAlchemy
- **Database:** PostgreSQL
- **AI:** Amazon Bedrock + Amazon Nova 2 Lite
- **Cloud:** AWS

## Project structure

```text
FRONTEND/   React frontend
BACKEND/    FastAPI backend, SQL models, and data scripts
```

## Quick start

### Frontend

```bash
cd FRONTEND
npm install
npm run dev
```

### Backend

See the detailed backend setup guide in `BACKEND/Readme`.

## Demo flow

1. Start the backend
2. Open `http://127.0.0.1:8000/docs`
3. Create a project with `POST /projects/`
4. Run `POST /projects/{project_id}/analyze`
5. Review the returned frameworks, risk level, concerns, and next actions

## Notes

- The backend expects local PostgreSQL access through a `.env` file.
- Amazon Nova access requires valid AWS credentials and Bedrock permissions.
- Do not commit `.env`, `__pycache__`, or other local artifacts to the repository.

## Recommended `.gitignore`

```gitignore
.env
__pycache__/
*.pyc
.DS_Store
```
