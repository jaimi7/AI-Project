from dataclasses import dataclass
from datetime import date, datetime, time
from enum import StrEnum
from uuid import UUID


class ScheduleType(StrEnum):
    ONCE = "once"
    DAILY = "daily"
    WEEKDAYS = "weekdays"
    WEEKENDS = "weekends"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"


@dataclass(slots=True)
class Reminder:
    id: UUID
    title: str
    details: str | None
    date: date
    time: time
    schedule_type: ScheduleType
    custom_days: list[int]
    enabled: bool
    created_at: datetime
    updated_at: datetime
