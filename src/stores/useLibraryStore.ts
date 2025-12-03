import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Book, BookFilter, BookSort, ReadingSession } from '../types'
import { getAllBooks, addBook, updateBook, deleteBook, addSession, getTodaySessions } from '../lib/db'

interface LibraryState {
  books: Book[]
  isLoading: boolean
  filter: BookFilter
  sort: BookSort
  searchQuery: string
  selectedBookId: string | null
  
  // Actions
  loadBooks: () => Promise<void>
  importBook: (file: File, metadata: { title: string; author?: string; totalPages: number; coverThumbnail?: Blob }) => Promise<void>
  updateProgress: (bookId: string, currentPage: number, sessionDuration?: number) => Promise<void>
  archiveBook: (bookId: string) => Promise<void>
  removeBook: (bookId: string) => Promise<void>
  setFilter: (filter: BookFilter) => void
  setSort: (sort: BookSort) => void
  setSearchQuery: (query: string) => void
  setSelectedBook: (bookId: string | null) => void
  
  // Computed
  getFilteredBooks: () => Book[]
  getLastReadBook: () => Book | null
  getTodayPagesRead: () => Promise<number>
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: [],
  isLoading: true,
  filter: 'all',
  sort: 'lastRead',
  searchQuery: '',
  selectedBookId: null,
  
  loadBooks: async () => {
    set({ isLoading: true })
    try {
      const books = await getAllBooks()
      set({ books, isLoading: false })
    } catch (error) {
      console.error('Failed to load books:', error)
      set({ isLoading: false })
    }
  },
  
  importBook: async (file, metadata) => {
    const now = new Date().toISOString()
    const book: Book = {
      id: uuidv4(),
      title: metadata.title,
      author: metadata.author,
      totalPages: metadata.totalPages,
      currentPage: 0,
      percentComplete: 0,
      totalReadingTime: 0,
      coverThumbnail: metadata.coverThumbnail,
      pdfBlob: file,
      tags: [],
      priority: 'medium',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
    
    await addBook(book)
    set((state) => ({ books: [...state.books, book] }))
  },
  
  updateProgress: async (bookId, currentPage, sessionDuration = 0) => {
    const book = get().books.find((b) => b.id === bookId)
    if (!book) return
    
    const previousPage = book.currentPage
    const pagesRead = Math.max(0, currentPage - previousPage)
    const percentComplete = Math.round((currentPage / book.totalPages) * 100)
    const status = percentComplete >= 100 ? 'completed' : book.status
    const now = new Date().toISOString()
    
    // Update book
    await updateBook(bookId, {
      currentPage,
      percentComplete: Math.min(100, percentComplete),
      totalReadingTime: book.totalReadingTime + sessionDuration,
      status,
      lastReadAt: now,
    })
    
    // Log session if pages were read
    if (pagesRead > 0) {
      const session: ReadingSession = {
        id: uuidv4(),
        bookId,
        startPage: previousPage,
        endPage: currentPage,
        pagesRead,
        duration: sessionDuration,
        date: now.split('T')[0],
      }
      await addSession(session)
    }
    
    // Update local state
    set((state) => ({
      books: state.books.map((b) =>
        b.id === bookId
          ? {
              ...b,
              currentPage,
              percentComplete: Math.min(100, percentComplete),
              totalReadingTime: b.totalReadingTime + sessionDuration,
              status,
              lastReadAt: now,
              updatedAt: now,
            }
          : b
      ),
    }))
  },
  
  archiveBook: async (bookId) => {
    await updateBook(bookId, { status: 'archived' })
    set((state) => ({
      books: state.books.map((b) =>
        b.id === bookId ? { ...b, status: 'archived', updatedAt: new Date().toISOString() } : b
      ),
    }))
  },
  
  removeBook: async (bookId) => {
    await deleteBook(bookId)
    set((state) => ({
      books: state.books.filter((b) => b.id !== bookId),
      selectedBookId: state.selectedBookId === bookId ? null : state.selectedBookId,
    }))
  },
  
  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedBook: (selectedBookId) => set({ selectedBookId }),
  
  getFilteredBooks: () => {
    const { books, filter, sort, searchQuery } = get()
    
    const filtered = books.filter((book) => {
      // Filter by status
      if (filter !== 'all' && book.status !== filter) return false
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          book.title.toLowerCase().includes(query) ||
          book.author?.toLowerCase().includes(query)
        )
      }
      
      return true
    })
    
    // Sort
    filtered.sort((a, b) => {
      switch (sort) {
        case 'lastRead':
          return (b.lastReadAt || b.createdAt).localeCompare(a.lastReadAt || a.createdAt)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'progress':
          return b.percentComplete - a.percentComplete
        case 'dateAdded':
          return b.createdAt.localeCompare(a.createdAt)
        default:
          return 0
      }
    })
    
    return filtered
  },
  
  getLastReadBook: () => {
    const { books } = get()
    const activeBooks = books.filter((b) => b.status === 'active' && b.lastReadAt)
    if (activeBooks.length === 0) return null
    
    return activeBooks.reduce((latest, book) =>
      (book.lastReadAt || '') > (latest.lastReadAt || '') ? book : latest
    )
  },
  
  getTodayPagesRead: async () => {
    const sessions = await getTodaySessions()
    return sessions.reduce((total, s) => total + s.pagesRead, 0)
  },
}))
