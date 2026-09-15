import type { Reminder, ReminderInput } from '../types/reminder'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message =
      payload?.detail || `Request failed with status ${response.status}`
    throw new Error(
      typeof message === 'string'
        ? message
        : 'The server rejected the request.',
    )
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const reminderApi = {
  list: () => request<Reminder[]>('/reminders'),
  get: (id: string) => request<Reminder>(`/reminders/${id}`),
  create: (input: ReminderInput) =>
    request<Reminder>('/reminders', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (id: string, input: ReminderInput) =>
    request<Reminder>(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  setStatus: (id: string, enabled: boolean) =>
    request<Reminder>(`/reminders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }),
  delete: (id: string) =>
    request<void>(`/reminders/${id}`, { method: 'DELETE' }),
}
