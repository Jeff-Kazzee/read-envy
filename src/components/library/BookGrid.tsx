import { BookOpen } from 'lucide-react'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { BookCard } from './BookCard'
import { ImportDropzone } from './ImportDropzone'
import type { BookFilter, BookSort } from '../../types'

interface BookGridProps {
  onBookClick: (bookId: string) => void
}

export function BookGrid({ onBookClick }: BookGridProps) {
  const { filter, sort, setFilter, setSort, getFilteredBooks, isLoading } = useLibraryStore()
  const books = getFilteredBooks()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--void-text-muted)]">Loading library...</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as BookFilter)}
            className="bg-[var(--void-surface)] border border-[var(--void-border)] rounded px-3 py-1.5 text-sm focus:border-[var(--accent-primary)] focus:outline-none"
          >
            <option value="all">All Books</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as BookSort)}
            className="bg-[var(--void-surface)] border border-[var(--void-border)] rounded px-3 py-1.5 text-sm focus:border-[var(--accent-primary)] focus:outline-none"
          >
            <option value="lastRead">Recently Read</option>
            <option value="title">Title A-Z</option>
            <option value="progress">Progress</option>
            <option value="dateAdded">Date Added</option>
          </select>
        </div>
        
        <div className="text-sm text-[var(--void-text-muted)]">
          {books.length} {books.length === 1 ? 'book' : 'books'}
        </div>
      </div>
      
      {/* Import dropzone */}
      <ImportDropzone />
      
      {/* Grid or empty state */}
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="w-16 h-16 text-[var(--void-text-dim)] mb-4" />
          <h3 className="text-lg font-medium mb-2">No books yet</h3>
          <p className="text-sm text-[var(--void-text-muted)] max-w-sm">
            Drag and drop a PDF above to start tracking your reading progress.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => onBookClick(book.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
