import { useState, useEffect, useCallback, useMemo } from 'react'
import { X } from 'lucide-react'
import type { Book } from '../../types'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useGoalsStore } from '../../stores/useGoalsStore'

interface QuickLogModalProps {
  book: Book
  onClose: () => void
}

export function QuickLogModal({ book, onClose }: QuickLogModalProps) {
  const [currentPage, setCurrentPage] = useState(book.currentPage.toString())
  const [isSaving, setIsSaving] = useState(false)
  const { updateProgress } = useLibraryStore()
  const { refreshTodayProgress } = useGoalsStore()
  
  const pageNumber = parseInt(currentPage, 10) || 0
  const percentComplete = Math.min(100, Math.round((pageNumber / book.totalPages) * 100))
  
  const coverUrl = useMemo(() => {
    if (book.coverThumbnail) {
      return URL.createObjectURL(book.coverThumbnail)
    }
    return null
  }, [book.coverThumbnail])
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSave()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage])
  
  const handleSave = useCallback(async () => {
    if (pageNumber < 0 || pageNumber > book.totalPages) return
    if (pageNumber === book.currentPage) {
      onClose()
      return
    }
    
    setIsSaving(true)
    try {
      await updateProgress(book.id, pageNumber)
      await refreshTodayProgress()
      onClose()
    } catch (error) {
      console.error('Failed to update progress:', error)
    } finally {
      setIsSaving(false)
    }
  }, [book.id, book.currentPage, book.totalPages, pageNumber, updateProgress, refreshTodayProgress, onClose])
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass rounded-lg w-full max-w-md p-6 mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-[var(--void-surface-hover)] transition-colors"
        >
          <X className="w-5 h-5 text-[var(--void-text-muted)]" />
        </button>
        
        {/* Header */}
        <h2 className="text-lg font-semibold mb-4">Update Progress</h2>
        
        {/* Book info */}
        <div className="flex gap-4 mb-6">
          {/* Cover */}
          <div className="w-16 h-20 rounded overflow-hidden bg-[var(--void-bg)] flex-shrink-0">
            {coverUrl ? (
              <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--accent-primary)] to-[var(--void-bg)]">
                <span className="text-xl font-bold text-white/20">
                  {book.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{book.title}</h3>
            {book.author && (
              <p className="text-sm text-[var(--void-text-muted)] truncate">{book.author}</p>
            )}
          </div>
        </div>
        
        {/* Page input */}
        <div className="mb-6">
          <label className="block text-sm text-[var(--void-text-muted)] mb-2">
            Current Page
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={book.totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
              className="flex-1 bg-[var(--void-bg)] border border-[var(--void-border)] rounded px-4 py-2 text-lg font-mono text-center focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
              autoFocus
            />
            <span className="text-[var(--void-text-muted)]">/ {book.totalPages}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-[var(--void-border)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percentComplete >= 100
                  ? 'bg-[var(--accent-success)] progress-glow'
                  : 'bg-[var(--accent-primary)]'
              }`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <p className="text-center text-sm font-mono text-[var(--void-text-muted)] mt-2">
            {percentComplete}% complete
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[var(--void-border)] rounded hover:bg-[var(--void-surface-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || pageNumber < 0 || pageNumber > book.totalPages}
            className="flex-1 px-4 py-2 bg-[var(--accent-primary)] text-white rounded hover:bg-[var(--accent-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}
