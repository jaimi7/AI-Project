from enum import StrEnum

from pydantic import BaseModel, Field, HttpUrl, model_validator


class ReviewTone(StrEnum):
    NATURAL = "natural"
    FRIENDLY = "friendly"
    PROFESSIONAL = "professional"
    ENTHUSIASTIC = "enthusiastic"
    CONSTRUCTIVE = "constructive"


class ReviewLength(StrEnum):
    SHORT = "short"
    MEDIUM = "medium"
    DETAILED = "detailed"


class GenerateReviewRequest(BaseModel):
    place_name: str = Field(min_length=1, max_length=160)
    category: str = Field(default="other", min_length=1, max_length=50)
    keywords: list[str] = Field(default_factory=list, max_length=20)
    experience_notes: str = Field(default="", max_length=3000)
    rating: int = Field(ge=1, le=5)
    tone: ReviewTone = ReviewTone.NATURAL
    length: ReviewLength = ReviewLength.MEDIUM
    language: str = Field(default="English", min_length=2, max_length=50)
    review_url: HttpUrl | None = None

    @model_validator(mode="after")
    def require_experience_details(self) -> "GenerateReviewRequest":
        cleaned_keywords = [keyword.strip() for keyword in self.keywords if keyword.strip()]
        self.keywords = cleaned_keywords
        if not self.experience_notes.strip() and not cleaned_keywords:
            raise ValueError("Add experience notes or at least one keyword")
        return self


class OptimizeReviewRequest(BaseModel):
    review: str = Field(min_length=10, max_length=6000)
    instruction: str = Field(min_length=2, max_length=300)
    language: str = Field(default="English", min_length=2, max_length=50)


class ReviewTextResponse(BaseModel):
    review: str
    provider: str
