# AI Project

A full-stack starter with a Nuxt 3 web/mobile frontend and a FastAPI backend.

## Project structure

```text
.
├── frontend/   # Nuxt 3, TypeScript, Pinia, and Capacitor
└── backend/    # FastAPI, Uvicorn, and Pydantic Settings
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Python 3.11 or newer
- Android Studio and/or Xcode when adding native Capacitor projects

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

On Windows PowerShell, activate the environment with:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies, create the local environment file, and start the API:

```bash
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The health endpoint is available at `http://localhost:8000/api/v1/health` and interactive API documentation at `http://localhost:8000/docs`.

## Frontend setup

In another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. The home page calls the backend health endpoint.

Useful checks:

```bash
npm run lint
npm run build
npm run generate
```

## Capacitor setup

Capacitor is configured to use Nuxt's generated static output in `.output/public`. Generate the frontend before synchronizing native projects:

```bash
cd frontend
npm run generate
npx cap add android   # first-time Android setup
npx cap add ios       # first-time iOS setup; requires macOS
npm run cap:sync
```

The generated `android` and `ios` directories are intentionally ignored until the team decides to version native platform projects. Use `npm run cap:android` or `npm run cap:ios` to open an existing native project.

## Environment variables

Copy each `.env.example` to `.env`. Local `.env` files are ignored by Git.

- `frontend/NUXT_PUBLIC_API_BASE_URL` controls the API URL used by the client.
- `backend/APP_NAME`, `ENVIRONMENT`, `API_V1_PREFIX`, and `BACKEND_CORS_ORIGINS` configure the API.
