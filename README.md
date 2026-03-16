# Better Call Nova

Better Call Nova is a project built for the Amazon Nova AI Hackathon. The app helps founders and teams quickly assess an AI product for likely governance and compliance risks using Amazon Nova on AWS.

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

Follow these steps to run the backend locally.

#### 1. Navigate to the backend folder

```bash
cd BACKEND
```

#### 2. Create a Python virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

If the requirements file is unavailable:

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary boto3 python-dotenv
```

#### 3. Setup PostgreSQL database

Create the database:

```bash
createdb ai_regulation_copilot
```

Or inside PostgreSQL:

```sql
CREATE DATABASE ai_regulation_copilot;
```

#### 4. Configure environment variables

Create a `.env` file inside the `BACKEND` directory:

```
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_regulation_copilot

AWS_REGION=us-east-1
NOVA_MODEL_ID=amazon.nova-lite-v1:0

UPLOAD_BUCKET=
```

#### 5. (Optional) Load the regulation dataset

```bash
psql ai_regulation_copilot -f sql/US_BILLS_PUSH/COUNTRY_TABLE.sql
psql ai_regulation_copilot -f sql/US_BILLS_PUSH/DATA_US.sql
psql ai_regulation_copilot -f sql/US_BILLS_PUSH/Sections_Table.sql
psql ai_regulation_copilot -f sql/US_BILLS_PUSH/section_text_all.sql
```

#### 6. Initialize application tables

```bash
python -m db.init_db
```

This creates the application tables such as:
- projects
- uploaded_files
- analyses

#### 7. Start the backend server

```bash
uvicorn app:app --reload
```

The API will start at:

```
http://127.0.0.1:8000
```

#### 8. Test the API

Open the Swagger interface:

```
http://127.0.0.1:8000/docs
```

Example project request:

```json
{
  "name": "HireScreen AI",
  "industry": "HR Tech",
  "region": "US",
  "use_case": "AI system that ranks job candidates",
  "description": "Tool that analyzes resumes and recommends candidates."
}
```

Then run:

```
POST /projects/{project_id}/analyze
```

The API will return:
- risk_level
- frameworks
- concerns
- next_actions
- rationale

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