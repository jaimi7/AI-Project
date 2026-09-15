import { Capacitor } from '@capacitor/core'
import {
  LocalNotifications,
  type LocalNotificationSchema,
  type PermissionStatus,
} from '@capacitor/local-notifications'

import type { Reminder } from '../types/reminder'
import { calculateOccurrences } from '../utils/scheduling'

const STORAGE_KEY = 'reminder-notification-ids'

function readIdMap(): Record<string, number[]> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<
      string,
      number[]
    >
  } catch {
    return {}
  }
}

function writeIdMap(value: Record<string, number[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

function baseId(reminderId: string): number {
  let hash = 0
  for (const char of reminderId) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return Math.abs(hash % 100_000_000) * 10
}

export const notificationService = {
  isNative: () => Capacitor.isNativePlatform(),

  async permissionStatus(): Promise<PermissionStatus['display'] | 'web'> {
    if (!Capacitor.isNativePlatform()) return 'web'
    return (await LocalNotifications.checkPermissions()).display
  },

  async requestPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false
    const current = await LocalNotifications.checkPermissions()
    if (current.display === 'granted') return true
    return (await LocalNotifications.requestPermissions()).display === 'granted'
  },

  async cancel(reminderId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return
    const map = readIdMap()
    const ids = map[reminderId] || []
    if (ids.length)
      await LocalNotifications.cancel({
        notifications: ids.map((id) => ({ id })),
      })
    delete map[reminderId]
    writeIdMap(map)
  },

  async schedule(reminder: Reminder, requestPermission = true): Promise<void> {
    if (!Capacitor.isNativePlatform()) return
    await this.cancel(reminder.id)
    if (!reminder.enabled) return

    const permitted = requestPermission
      ? await this.requestPermission()
      : (await LocalNotifications.checkPermissions()).display === 'granted'
    if (!permitted)
      throw new Error(
        'Notification permission is required to enable reminders.',
      )

    const ids: number[] = []
    const notifications: LocalNotificationSchema[] = calculateOccurrences(
      reminder,
    ).map((schedule, index) => {
      const id = baseId(reminder.id) + index
      ids.push(id)
      return {
        id,
        title: reminder.title,
        body: reminder.details || 'It is time for your reminder.',
        schedule: { ...schedule, allowWhileIdle: true },
        extra: { reminderId: reminder.id },
      }
    })

    await LocalNotifications.schedule({ notifications })
    const map = readIdMap()
    map[reminder.id] = ids
    writeIdMap(map)
  },
}
