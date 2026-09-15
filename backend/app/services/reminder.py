from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID, uuid4

from fastapi import HTTPException, status

from app.models.reminder import Reminder
from app.repositories.reminder import ReminderRepository
from app.schemas.reminder import ReminderCreate, ReminderUpdate


class ReminderService:
    def __init__(self, repository: ReminderRepository) -> None:
        self._repository = repository

    def list(self) -> list[Reminder]:
        return self._repository.list()

    def get(self, reminder_id: UUID) -> Reminder:
        reminder = self._repository.get(reminder_id)
        if reminder is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Reminder not found")
        return reminder

    def create(self, payload: ReminderCreate) -> Reminder:
        now = datetime.now(UTC)
        reminder = Reminder(
            id=uuid4(),
            created_at=now,
            updated_at=now,
            **payload.model_dump(),
        )
        return self._repository.save(reminder)

    def update(self, reminder_id: UUID, payload: ReminderUpdate) -> Reminder:
        existing = self.get(reminder_id)
        reminder = replace(
            existing,
            **payload.model_dump(),
            updated_at=datetime.now(UTC),
        )
        return self._repository.save(reminder)

    def set_status(self, reminder_id: UUID, enabled: bool) -> Reminder:
        existing = self.get(reminder_id)
        reminder = replace(existing, enabled=enabled, updated_at=datetime.now(UTC))
        return self._repository.save(reminder)

    def delete(self, reminder_id: UUID) -> None:
        self.get(reminder_id)
        self._repository.delete(reminder_id)
