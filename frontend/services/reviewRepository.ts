import { Capacitor } from '@capacitor/core'
import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from '@capacitor-community/sqlite'

import type { ReviewRecord } from '~/types/review'

const DATABASE_NAME = 'ai_review_assistant'
const STORAGE_KEY = 'ai-review-assistant:reviews'

class ReviewRepository {
  private database: SQLiteDBConnection | null = null
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized || !import.meta.client) return

    if (Capacitor.isNativePlatform()) {
      const sqlite = new SQLiteConnection(CapacitorSQLite)
      const consistency = await sqlite.checkConnectionsConsistency()
      const existing = await sqlite.isConnection(DATABASE_NAME, false)

      this.database = consistency.result && existing.result
        ? await sqlite.retrieveConnection(DATABASE_NAME, false)
        : await sqlite.createConnection(DATABASE_NAME, false, 'no-encryption', 1, false)

      await this.database.open()
      await this.database.execute(`
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY NOT NULL,
          payload TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS reviews_updated_at_idx ON reviews(updated_at);
      `)
    }

    this.initialized = true
  }

  async list(): Promise<ReviewRecord[]> {
    await this.initialize()
    if (this.database) {
      const result = await this.database.query(
        'SELECT payload FROM reviews ORDER BY updated_at DESC',
      )
      return (result.values ?? []).map(({ payload }) => JSON.parse(String(payload)))
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    try {
      return (JSON.parse(raw) as ReviewRecord[]).sort(
        (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
      )
    } catch {
      return []
    }
  }

  async save(review: ReviewRecord): Promise<void> {
    await this.initialize()
    if (this.database) {
      await this.database.run(
        `INSERT OR REPLACE INTO reviews (id, payload, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        [review.id, JSON.stringify(review), review.createdAt, review.updatedAt],
      )
      return
    }

    const reviews = await this.list()
    const index = reviews.findIndex(({ id }) => id === review.id)
    if (index >= 0) reviews[index] = review
    else reviews.unshift(review)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
  }

  async remove(id: string): Promise<void> {
    await this.initialize()
    if (this.database) {
      await this.database.run('DELETE FROM reviews WHERE id = ?', [id])
      return
    }

    const reviews = (await this.list()).filter((review) => review.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
  }
}

export const reviewRepository = new ReviewRepository()
