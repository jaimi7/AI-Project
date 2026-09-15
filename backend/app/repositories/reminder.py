from threading import RLock
from typing import Protocol
from uuid import UUID

from app.models.reminder import Reminder


class ReminderRepository(Protocol):
    def list(self) -> list[Reminder]: ...

    def get(self, reminder_id: UUID) -> Reminder | None: ...

    def save(self, reminder: Reminder) -> Reminder: ...

    def delete(self, reminder_id: UUID) -> bool: ...


class InMemoryReminderRepository:
    """Replace this implementation with a database repository later."""

    def __init__(self) -> None:
        self._items: dict[UUID, Reminder] = {}
        self._lock = RLock()

    def list(self) -> list[Reminder]:
        with self._lock:
            return sorted(
                self._items.values(),
                key=lambda reminder: (reminder.date, reminder.time, reminder.created_at),
            )

    def get(self, reminder_id: UUID) -> Reminder | None:
        with self._lock:
            return self._items.get(reminder_id)

    def save(self, reminder: Reminder) -> Reminder:
        with self._lock:
            self._items[reminder.id] = reminder
            return reminder

    def delete(self, reminder_id: UUID) -> bool:
        with self._lock:
            return self._items.pop(reminder_id, None) is not None
