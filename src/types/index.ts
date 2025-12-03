// Book record stored in IndexedDB
export interface Book {
  id: string
  title: string
  author?: string
  totalPages: number
  currentPage: number
  percentComplete: number
  totalReadingTime: number // seconds
  coverThumbnail?: Blob
  pdfBlob: Blob
  tags: string[]
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'archived' | 'completed'
  createdAt: string
  updatedAt: string
  lastReadAt?: string
}

// Reading session log
export interface ReadingSession {
  id: string
  bookId: string
  startPage: number
  endPage: number
  pagesRead: number
  duration: number // seconds
  date: string // ISO date string
}

// User goal
export interface Goal {
  id: string
  type: 'daily_pages' | 'weekly_pages' | 'books_per_month'
  target: number
  createdAt: string
}

// Streak tracking
export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string // ISO date string
}

// Stats for dashboard
export interface WeeklyStats {
  pagesRead: number
  timeSpent: number // seconds
  booksOpened: number
  sessionsCount: number
  dailyBreakdown: { date: string; pages: number }[]
}

// UI filter/sort state
export type BookFilter = 'all' | 'active' | 'completed' | 'archived'
export type BookSort = 'lastRead' | 'title' | 'progress' | 'dateAdded'
