# ReviewMate — AI Review Assistant

Local-first mobile review assistant built with Nuxt, Vue, TypeScript, Pinia, Capacitor, SQLite, and FastAPI.

## Features

- Generate honest reviews from a name, rating, experience notes, and keywords
- Optimize review length, grammar, tone, and constructive feedback
- Edit and explicitly approve final text
- Scan an HTTPS review-page QR code or enter its URL manually
- Copy an approved review and open its destination page for manual posting
- Save, search, filter, edit, and delete local review history
- Use SQLite on Android/iOS and local storage during web development
- Connect to an OpenAI-compatible provider without exposing its key in the app
- Run Cypress E2E tests locally or through Docker Compose

The app never submits a review automatically. The user approves the content and posts it personally.

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

The default `AI_PROVIDER=mock` works without an API key. To use a real OpenAI-compatible provider, update `backend/.env`:

```dotenv
AI_PROVIDER=openai
AI_API_KEY=your_api_key
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=your_supported_model
```

The API key remains on the backend and is never bundled into the mobile application.

## Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000` to create, improve, approve, and manage reviews.

## Production builds

```bash
cd backend
python -m compileall app

cd ../frontend
npm run build
```

## End-to-end tests

Cypress covers review generation, approval, local history, and form validation.

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

For QR scanning, add `NSCameraUsageDescription` to the iOS application `Info.plist`. On Android, verify camera permission in the generated manifest after running `npx cap sync`.

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

## Backend tests

```bash
cd backend
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
```

## Storage behavior

History is local to the current device or browser profile. Native applications use SQLite and the web build uses local storage. Cloud login and multi-device synchronization are not enabled, so private review history is not uploaded to an application database.
