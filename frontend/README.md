# Frontend

## Getting Started

Make sure you are in the `AWS_Nova_hackathon` directory.

### 1. Backend

Open a terminal:

```bash
cd BACKEND
python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend

Open a **new terminal tab**:

```bash
cd frontend
npm install
npm run dev
```

#### If `npm` command is not found

Run this once to fix your PATH:

```bash
source ~/.zshrc
```

If that still doesn't work, use the full path:

```bash
/opt/homebrew/bin/npm run dev
```

### 3. Open the app

Open the URL printed by Vite (e.g. http://localhost:5175) in your browser.

## Uncommitted Changes — Frontend

### Modified Files

- **`vite.config.ts`** — Added API proxy to forward `/api` requests to backend on port 8000
- **`src/components/analysis/AnalyzeButton/AnalyzeButton.tsx`** — Updated analyze button with backend integration
- **`src/components/input/TextInput/TextInput.tsx`** — Enhanced text input with language support
- **`src/pages/DashboardPage/DashboardPage.tsx`** — Updated dashboard imports
- **`src/types/index.ts`** — Added new TypeScript types for analysis results

### New Files

- **`src/services/api.ts`** — API service layer (analyze, generate, regulations, bills, projects, health check)
- **`src/components/results/RelevantBills/RelevantBills.tsx`** — New component for displaying relevant bills
