# AI Review Assistant

Full-stack starter for a mobile-first AI review assistant. The frontend uses Nuxt, Vue, TypeScript, Capacitor, and the Capacitor Community SQLite plugin. The backend uses FastAPI. Database initialization and AI-powered review generation can be added in the next feature phase.

## Project structure

```text
.
├── frontend/   # Nuxt application and Capacitor configuration
└── backend/    # FastAPI application
```

## Prerequisites

- Node.js 22 or newer
- npm 10 or newer
- Python 3.12 or newer
- Android Studio for Android builds
- macOS with Xcode for iOS builds

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is available at `http://localhost:8000`. Check it with:

```bash
curl http://localhost:8000/api/health
```

## Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. The page calls the FastAPI health-check endpoint and displays the connection status.

## Production builds

```bash
cd backend
python -m compileall app

cd ../frontend
npm run build
```

## Capacitor setup

The project uses a client-rendered Nuxt build so the generated output can be bundled in a native WebView.

Generate the web assets and add each native platform once:

```bash
cd frontend
npm run generate
npm run cap:add:android
npm run cap:add:ios
```

After web changes, synchronize the native projects:

```bash
npm run cap:sync
```

Open a native project with:

```bash
npm run cap:open:android
npm run cap:open:ios
```

The generated `android/` and `ios/` directories are intentionally ignored until the team decides to maintain native projects in source control.

### API URLs on devices

`NUXT_PUBLIC_API_BASE_URL` defaults to `http://localhost:8000`. A native app cannot normally reach the host computer using `localhost`.

- Android emulator: use `http://10.0.2.2:8000`
- iOS simulator: `http://localhost:8000` usually works
- Physical device: use the computer's LAN IP and ensure the backend is reachable

Update `frontend/.env` before generating and synchronizing the native build.

## Environment configuration

Copy the example files before development:

- `frontend/.env.example` → `frontend/.env`
- `backend/.env.example` → `backend/.env`

Never commit real API keys or secrets.
