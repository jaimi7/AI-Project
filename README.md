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

## End-to-end tests

Cypress covers the frontend health-check flow with successful and unavailable API responses.

Start the Nuxt application:

```bash
cd frontend
npm run dev
```

Then run Cypress in another terminal:

```bash
cd frontend
npm run test:e2e
```

For the interactive Cypress runner, use:

```bash
npm run cypress:open
```

## Docker

Build and start the complete web stack:

```bash
cp .env.example .env
docker compose up --build
```

Open the frontend at `http://localhost:3000`. The API remains available directly at `http://localhost:8000`, while Nginx also proxies frontend requests from `/api` to FastAPI inside the Docker network.

Stop the stack with:

```bash
docker compose down
```

Run the containerized Cypress suite against the containerized application:

```bash
docker compose --profile e2e up --build --abort-on-container-exit --exit-code-from e2e
```

The web application, API, and E2E runner are containerized. Capacitor uses the generated web bundle, but native Android and iOS packaging remains a host-platform operation: Android requires the Android SDK, and iOS requires macOS with Xcode.

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
