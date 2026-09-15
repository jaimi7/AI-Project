from uuid import UUID

from fastapi import APIRouter, Response, status

from app.repositories.reminder import InMemoryReminderRepository
from app.schemas.reminder import (
    ReminderCreate,
    ReminderResponse,
    ReminderStatusUpdate,
    ReminderUpdate,
)
from app.services.reminder import ReminderService

router = APIRouter(prefix="/reminders")
service = ReminderService(InMemoryReminderRepository())


@router.get("", response_model=list[ReminderResponse])
def list_reminders() -> list[ReminderResponse]:
    return [ReminderResponse.from_model(item) for item in service.list()]


@router.get("/{reminder_id}", response_model=ReminderResponse)
def get_reminder(reminder_id: UUID) -> ReminderResponse:
    return ReminderResponse.from_model(service.get(reminder_id))


@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(payload: ReminderCreate) -> ReminderResponse:
    return ReminderResponse.from_model(service.create(payload))


@router.put("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(reminder_id: UUID, payload: ReminderUpdate) -> ReminderResponse:
    return ReminderResponse.from_model(service.update(reminder_id, payload))


@router.patch("/{reminder_id}/status", response_model=ReminderResponse)
def update_reminder_status(
    reminder_id: UUID, payload: ReminderStatusUpdate
) -> ReminderResponse:
    return ReminderResponse.from_model(service.set_status(reminder_id, payload.enabled))


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(reminder_id: UUID) -> Response:
    service.delete(reminder_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
