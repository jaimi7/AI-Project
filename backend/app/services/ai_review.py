import os
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.models.review import GenerateReviewRequest, OptimizeReviewRequest


SYSTEM_PROMPT = """You help people write honest first-person reviews based only on details they provide.
Never invent food, service, facilities, prices, people, events, or outcomes. Preserve mixed or negative
feedback instead of turning every review positive. Return only the final review text, with no heading,
quotation marks, rating, disclaimer, or explanation."""


class AIReviewService:
    def __init__(self) -> None:
        self.provider = os.getenv("AI_PROVIDER", "mock").strip().lower()
        self.api_key = os.getenv("AI_API_KEY", "").strip()
        self.base_url = os.getenv("AI_API_BASE_URL", "https://api.openai.com/v1").rstrip("/")
        self.model = os.getenv("AI_MODEL", "").strip()

    async def generate(self, request: GenerateReviewRequest) -> str:
        if self.provider == "mock":
            return self._mock_generate(request)

        prompt = (
            f"Place or item: {request.place_name}\n"
            f"Category: {request.category}\n"
            f"Rating: {request.rating}/5\n"
            f"Keywords: {', '.join(request.keywords) or 'None'}\n"
            f"Experience notes: {request.experience_notes or 'None'}\n"
            f"Tone: {request.tone.value}\n"
            f"Length: {request.length.value}\n"
            f"Output language: {request.language}\n\n"
            "Write a natural review grounded strictly in these details."
        )
        return await self._complete(prompt)

    async def optimize(self, request: OptimizeReviewRequest) -> str:
        if self.provider == "mock":
            return self._mock_optimize(request)

        prompt = (
            f"Existing review:\n{request.review}\n\n"
            f"Instruction: {request.instruction}\n"
            f"Output language: {request.language}\n\n"
            "Revise the review while preserving every factual detail and the writer's honest sentiment."
        )
        return await self._complete(prompt)

    async def _complete(self, prompt: str) -> str:
        if not self.api_key or not self.model:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI_API_KEY and AI_MODEL must be configured for the selected AI provider",
            )

        payload: dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.6,
        }

        try:
            async with httpx.AsyncClient(timeout=45) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI provider returned HTTP {exc.response.status_code}",
            ) from exc
        except (httpx.HTTPError, ValueError, KeyError) as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to generate a review with the configured AI provider",
            ) from exc

        review = data["choices"][0]["message"]["content"].strip()
        if not review:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI provider returned an empty review",
            )
        return review

    @staticmethod
    def _mock_generate(request: GenerateReviewRequest) -> str:
        details = request.experience_notes.strip()
        keyword_text = ", ".join(request.keywords)
        opening = f"I recently visited {request.place_name}"
        if request.category != "other":
            opening += f" for a {request.category} experience"
        opening += "."

        body_parts = []
        if details:
            body_parts.append(details.rstrip(".!?") + ".")
        if keyword_text:
            body_parts.append(f"The details that stood out to me were {keyword_text}.")

        rating_sentiment = {
            1: "Unfortunately, the overall experience did not meet my expectations.",
            2: "There were some positives, but the overall experience needs improvement.",
            3: "Overall, it was a mixed but reasonable experience.",
            4: "Overall, I had a good experience and would consider returning.",
            5: "Overall, I had an excellent experience and would happily return.",
        }[request.rating]

        if request.length.value == "short":
            body_parts = body_parts[:1]
        elif request.length.value == "detailed" and details:
            body_parts.append("This summary reflects what I personally experienced during the visit.")

        return " ".join([opening, *body_parts, rating_sentiment])

    @staticmethod
    def _mock_optimize(request: OptimizeReviewRequest) -> str:
        review = " ".join(request.review.split())
        instruction = request.instruction.lower()
        if "short" in instruction:
            sentences = review.split(". ")
            return ". ".join(sentences[:2]).rstrip(".") + "."
        return review
