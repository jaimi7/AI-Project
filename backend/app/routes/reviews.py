from fastapi import APIRouter

from app.models.review import (
    GenerateReviewRequest,
    OptimizeReviewRequest,
    ReviewTextResponse,
)
from app.services.ai_review import AIReviewService


router = APIRouter(tags=["reviews"])


@router.post("/generate", response_model=ReviewTextResponse)
async def generate_review(request: GenerateReviewRequest) -> ReviewTextResponse:
    service = AIReviewService()
    review = await service.generate(request)
    return ReviewTextResponse(review=review, provider=service.provider)


@router.post("/optimize", response_model=ReviewTextResponse)
async def optimize_review(request: OptimizeReviewRequest) -> ReviewTextResponse:
    service = AIReviewService()
    review = await service.optimize(request)
    return ReviewTextResponse(review=review, provider=service.provider)
