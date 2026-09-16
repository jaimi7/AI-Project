# Reminderly — Notification Automation

A mobile-first reminder application built with Vue 3, TypeScript, Pinia, Capacitor Local Notifications, and FastAPI.

## Features

- Create, view, edit, delete, enable, and disable reminders
- One-time, daily, weekday, weekend, weekly, monthly, and custom-day schedules
- Contextual notification permission request when enabling a reminder or from Settings
- Local-device scheduling with cancellation and rescheduling to prevent duplicates
- Local-time and next-occurrence calculation
- Loading, validation, empty, and API error states
- Repository abstraction ready to replace in-memory storage with PostgreSQL

## Structure

```text
.
├── frontend/
│   └── src/
│       ├── components/  # Reusable app shell, cards, and form
│       ├── router/      # Vue Router configuration
│       ├── services/    # API and device notification integrations
│       ├── stores/      # Pinia reminder state
│       ├── types/       # TypeScript reminder contracts
│       ├── utils/       # Schedule and display calculations
│       └── views/       # Home, list, create, edit, details, settings
└── backend/
    ├── app/
    │   ├── api/         # FastAPI routes
    │   ├── core/        # Environment configuration
    │   ├── models/      # Domain models
    │   ├── repositories/# Replaceable persistence layer
    │   ├── schemas/     # Pydantic API contracts
    │   └── services/    # Business logic
    └── tests/
```

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+
- Python 3.11+
- Android Studio and/or Xcode for native builds

## Run the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On Windows PowerShell, activate with `.venv\Scripts\Activate.ps1`.

- API: `http://localhost:8000/api/v1`
- Health: `http://localhost:8000/api/v1/health`
- OpenAPI docs: `http://localhost:8000/docs`

Run backend tests with:

```bash
cd backend
.venv/bin/pytest -q
```

The MVP uses an in-memory repository, so reminders reset when the API restarts. Implement the existing `ReminderRepository` protocol with PostgreSQL when persistent storage is added.

## Run the frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. Keep the FastAPI server running for reminder CRUD operations.

Quality checks:

```bash
npm run lint
npm run format:check
npm run build
```

## Docker

The production-style stack builds the Vue application, serves it through Nginx, proxies `/api` requests to FastAPI, and runs the API with multiple Uvicorn workers.

```bash
cp .env.docker.example .env
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API documentation: `http://localhost:8000/docs`

Stop and remove the containers with:

```bash
docker compose down
```

For development with Vue and FastAPI hot reload, use the standalone development configuration:

```bash
docker compose -f compose.dev.yaml up --build
```

The development configuration mounts both source directories and keeps frontend dependencies in a named Docker volume.

Run the full Cypress flow inside Docker against the production containers with:

```bash
docker compose --profile e2e up --build --abort-on-container-exit --exit-code-from cypress
docker compose --profile e2e down
```

Override `FRONTEND_PORT`, `BACKEND_PORT`, `APP_NAME`, or `ENVIRONMENT` in the root `.env` file when necessary. Docker health checks prevent the frontend and Cypress services from starting before their dependencies are ready.

## Cypress end-to-end tests

The Cypress suite exercises the full reminder journey against the real FastAPI API: create, view, edit, disable, and delete.

After completing the normal frontend and backend installations, run both development servers and Cypress headlessly with one command:

```bash
cd frontend
npm run e2e:full
```

To use Cypress's interactive runner instead, start FastAPI and Vite in separate terminals, then run:

```bash
cd frontend
npm run e2e:open
```

Screenshots created by failed test runs and Cypress videos are ignored by Git.

## Build for Android or iOS

Capacitor uses the Vite production output in `frontend/dist`.

```bash
cd frontend
npm run build
npx cap add android   # first-time Android setup
npx cap add ios       # first-time iOS setup; requires macOS
npm run cap:sync
```

Open an initialized native project with `npm run cap:android` or `npm run cap:ios`.

Local Notifications run only on a native Android/iOS build. The web app supports the full CRUD flow but intentionally does not request browser notification permission. For Android 13+ and iOS, the app requests permission when a user first creates/enables a reminder or explicitly enables notifications in Settings.

## Environment variables

Copy each `.env.example` to `.env`; real environment files are ignored by Git.

- `frontend/VITE_API_BASE_URL` sets the backend URL.
- `backend/APP_NAME`, `ENVIRONMENT`, `API_V1_PREFIX`, and `BACKEND_CORS_ORIGINS` configure FastAPI.

For a physical device, set `VITE_API_BASE_URL` to a backend URL reachable from the device—not `localhost`.
