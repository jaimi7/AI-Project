export type ScheduleType =
  'once' | 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'monthly' | 'custom'

export interface ReminderInput {
  title: string
  details?: string
  date: string
  time: string
  scheduleType: ScheduleType
  customDays: number[]
  enabled: boolean
}

export interface Reminder extends ReminderInput {
  id: string
  createdAt: string
  updatedAt: string
}

export const scheduleOptions: Array<{ value: ScheduleType; label: string }> = [
  { value: 'once', label: 'One Time' },
  { value: 'daily', label: 'Every Day' },
  { value: 'weekdays', label: 'Every Weekday' },
  { value: 'weekends', label: 'Every Weekend' },
  { value: 'weekly', label: 'Every Week' },
  { value: 'monthly', label: 'Every Month' },
  { value: 'custom', label: 'Custom Days' },
]

export const weekDays = [
  { value: 1, short: 'M', label: 'Monday' },
  { value: 2, short: 'T', label: 'Tuesday' },
  { value: 3, short: 'W', label: 'Wednesday' },
  { value: 4, short: 'T', label: 'Thursday' },
  { value: 5, short: 'F', label: 'Friday' },
  { value: 6, short: 'S', label: 'Saturday' },
  { value: 0, short: 'S', label: 'Sunday' },
]
