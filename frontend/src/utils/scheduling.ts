import type { LocalNotificationSchedule } from '@capacitor/local-notifications'

import type { Reminder, ReminderInput, ScheduleType } from '../types/reminder'
import { scheduleOptions } from '../types/reminder'

export type NotificationOccurrence = LocalNotificationSchedule & { at: Date }

function parseDateTime(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute, second = 0] = time.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute, second, 0)
}

function nextAfter(
  initial: Date,
  now: Date,
  increment: (date: Date) => Date,
): Date {
  let candidate = new Date(initial)
  while (candidate <= now) candidate = increment(candidate)
  return candidate
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(date: Date): Date {
  const result = new Date(date)
  const targetDay = result.getDate()
  result.setDate(1)
  result.setMonth(result.getMonth() + 1)
  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate()
  result.setDate(Math.min(targetDay, lastDay))
  return result
}

function firstWeekdayOccurrence(
  initial: Date,
  weekday: number,
  now: Date,
): Date {
  let candidate = new Date(initial)
  while (candidate.getDay() !== weekday || candidate <= now) {
    candidate = addDays(candidate, 1)
  }
  return candidate
}

export function calculateOccurrences(
  reminder: ReminderInput,
  now = new Date(),
): NotificationOccurrence[] {
  const initial = parseDateTime(reminder.date, reminder.time)

  if (reminder.scheduleType === 'once') {
    if (initial <= now)
      throw new Error('Choose a future date and time for a one-time reminder.')
    return [{ at: initial }]
  }

  if (reminder.scheduleType === 'daily') {
    return [
      {
        at: nextAfter(initial, now, (date) => addDays(date, 1)),
        repeats: true,
        every: 'day',
      },
    ]
  }

  if (reminder.scheduleType === 'weekly') {
    return [
      {
        at: nextAfter(initial, now, (date) => addDays(date, 7)),
        repeats: true,
        every: 'week',
      },
    ]
  }

  if (reminder.scheduleType === 'monthly') {
    return [
      { at: nextAfter(initial, now, addMonths), repeats: true, every: 'month' },
    ]
  }

  const weekdays =
    reminder.scheduleType === 'weekdays'
      ? [1, 2, 3, 4, 5]
      : reminder.scheduleType === 'weekends'
        ? [0, 6]
        : reminder.customDays

  if (!weekdays.length) throw new Error('Select at least one custom day.')

  return weekdays.map((weekday) => ({
    at: firstWeekdayOccurrence(initial, weekday, now),
    repeats: true,
    every: 'week',
  }))
}

export function getNextOccurrence(
  reminder: ReminderInput,
  now = new Date(),
): Date | null {
  if (!reminder.enabled) return null
  try {
    return calculateOccurrences(reminder, now)
      .map((item) => item.at)
      .sort((a, b) => a.getTime() - b.getTime())[0]
  } catch {
    return null
  }
}

export function scheduleLabel(type: ScheduleType): string {
  return scheduleOptions.find((option) => option.value === type)?.label ?? type
}

export function formatTime(time: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(parseDateTime('2026-01-01', time))
}

export function formatNextOccurrence(
  reminder: Reminder,
  now = new Date(),
): string {
  const occurrence = getNextOccurrence(reminder, now)
  if (!occurrence)
    return reminder.enabled ? 'Needs a future schedule' : 'Disabled'

  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const sameDay = occurrence.toDateString() === now.toDateString()
  const nextDay = occurrence.toDateString() === tomorrow.toDateString()
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(occurrence)
  if (sameDay) return `Today, ${time}`
  if (nextDay) return `Tomorrow, ${time}`
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(occurrence)
}
