import Dexie, { type Table } from 'dexie'
import type { Book, ReadingSession, Goal, StreakData } from '../types'

// Define the database class
class ReadEnvyDB extends Dexie {
  books!: Table<Book, string>
  sessions!: Table<ReadingSession, string>
  goals!: Table<Goal, string>
  streaks!: Table<StreakData, number>

  constructor() {
    super('ReadEnvyDB')
    this.version(1).stores({
      books: 'id, title, status, priority, createdAt, updatedAt, lastReadAt',
      sessions: 'id, bookId, date',
      goals: 'id, type',
      streaks: '++id',
    })
  }
}

const db = new ReadEnvyDB()

export { db }

// Helper functions
export async function getAllBooks(): Promise<Book[]> {
  return db.books.toArray()
}

export async function getBookById(id: string): Promise<Book | undefined> {
  return db.books.get(id)
}

export async function addBook(book: Book): Promise<string> {
  return db.books.add(book)
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<number> {
  return db.books.update(id, { ...updates, updatedAt: new Date().toISOString() })
}

export async function deleteBook(id: string): Promise<void> {
  await db.books.delete(id)
  // Also delete associated sessions
  await db.sessions.where('bookId').equals(id).delete()
}

export async function addSession(session: ReadingSession): Promise<string> {
  return db.sessions.add(session)
}

export async function getSessionsByBookId(bookId: string): Promise<ReadingSession[]> {
  return db.sessions.where('bookId').equals(bookId).toArray()
}

export async function getSessionsByDateRange(startDate: string, endDate: string): Promise<ReadingSession[]> {
  return db.sessions.where('date').between(startDate, endDate, true, true).toArray()
}

export async function getTodaySessions(): Promise<ReadingSession[]> {
  const today = new Date().toISOString().split('T')[0]
  return db.sessions.where('date').equals(today).toArray()
}

export async function getGoals(): Promise<Goal[]> {
  return db.goals.toArray()
}

export async function setGoal(goal: Goal): Promise<string> {
  // Remove existing goal of same type
  await db.goals.where('type').equals(goal.type).delete()
  return db.goals.add(goal)
}

export async function getStreakData(): Promise<StreakData | undefined> {
  const streaks = await db.streaks.toArray()
  return streaks[0]
}

export async function updateStreakData(data: StreakData): Promise<void> {
  await db.streaks.clear()
  await db.streaks.add(data)
}
