import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes.reviews import router as reviews_router


load_dotenv()


def get_allowed_origins() -> list[str]:
    configured_origins = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost,capacitor://localhost",
    )
    return [origin.strip() for origin in configured_origins.split(",") if origin.strip()]


app = FastAPI(
    title="AI Review Assistant API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reviews_router, prefix="/api/reviews")


@app.get("/api/health", tags=["system"])
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "ai-review-assistant-api",
    }
