from datetime import date, datetime, time
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.reminder import Reminder, ScheduleType


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(word.capitalize() for word in rest)


class ReminderPayload(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    title: str = Field(min_length=1, max_length=120)
    details: str | None = Field(default=None, max_length=1000)
    date: date
    time: time
    schedule_type: ScheduleType
    custom_days: list[int] = Field(default_factory=list)
    enabled: bool = True

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Title is required")
        return value

    @field_validator("details")
    @classmethod
    def normalize_details(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None

    @field_validator("custom_days")
    @classmethod
    def validate_custom_days(cls, value: list[int]) -> list[int]:
        if any(day < 0 or day > 6 for day in value):
            raise ValueError("Custom days must be between 0 (Sunday) and 6 (Saturday)")
        return sorted(set(value))

    @model_validator(mode="after")
    def require_custom_days(self) -> "ReminderPayload":
        if self.schedule_type == ScheduleType.CUSTOM and not self.custom_days:
            raise ValueError("Select at least one custom day")
        if self.schedule_type != ScheduleType.CUSTOM:
            self.custom_days = []
        return self


class ReminderCreate(ReminderPayload):
    pass


class ReminderUpdate(ReminderPayload):
    pass


class ReminderStatusUpdate(BaseModel):
    enabled: bool


class ReminderResponse(ReminderPayload):
    id: UUID
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, reminder: Reminder) -> "ReminderResponse":
        return cls.model_validate(reminder, from_attributes=True)
