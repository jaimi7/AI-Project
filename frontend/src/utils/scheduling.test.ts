import { describe, expect, it } from 'vitest'

import type { ReminderInput } from '../types/reminder'
import { calculateOccurrences } from './scheduling'

const baseReminder: ReminderInput = {
  title: 'Standup',
  date: '2026-09-20',
  time: '09:00',
  scheduleType: 'once',
  customDays: [],
  enabled: true,
}

describe('calculateOccurrences', () => {
  it('rejects a past one-time reminder', () => {
    expect(() =>
      calculateOccurrences(baseReminder, new Date(2026, 8, 20, 9, 1)),
    ).toThrow('future date and time')
  })

  it('advances a daily reminder to its next valid local occurrence', () => {
    const [occurrence] = calculateOccurrences(
      { ...baseReminder, scheduleType: 'daily' },
      new Date(2026, 8, 20, 10),
    )
    expect(occurrence.at).toEqual(new Date(2026, 8, 21, 9))
    expect(occurrence.every).toBe('day')
  })

  it('creates Monday through Friday schedules for weekdays', () => {
    const occurrences = calculateOccurrences(
      { ...baseReminder, scheduleType: 'weekdays' },
      new Date(2026, 8, 20, 8),
    )
    expect(occurrences.map((item) => item.at.getDay()).sort()).toEqual([
      1, 2, 3, 4, 5,
    ])
    expect(occurrences.every((item) => item.every === 'week')).toBe(true)
  })

  it('schedules only selected custom weekdays', () => {
    const occurrences = calculateOccurrences(
      { ...baseReminder, scheduleType: 'custom', customDays: [1, 3, 5] },
      new Date(2026, 8, 20, 8),
    )
    expect(occurrences.map((item) => item.at.getDay()).sort()).toEqual([
      1, 3, 5,
    ])
  })

  it('requires at least one custom weekday', () => {
    expect(() =>
      calculateOccurrences(
        { ...baseReminder, scheduleType: 'custom', customDays: [] },
        new Date(2026, 8, 20, 8),
      ),
    ).toThrow('Select at least one custom day')
  })
})
