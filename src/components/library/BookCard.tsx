import { useMemo, useState } from 'react'
import { Clock, MoreVertical, Trash2, RotateCcw } from 'lucide-react'
import type { Book } from '../../types'
import { formatTimeShort } from '../../lib/utils'
import { useLibraryStore } from '../../stores/useLibraryStore'

interface BookCardProps {
  book: Book
  onClick: () => void
}

export function BookCard({ book, onClick }: BookCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const { removeBook, updateProgress } = useLibraryStore()
  const coverUrl = useMemo(() => {
    if (book.coverThumbnail) {
      return URL.createObjectURL(book.coverThumbnail)
    }
    return null
  }, [book.coverThumbnail])
  
  return (
    <div
      onClick={onClick}
      className="group relative bg-[var(--void-surface)] border border-[var(--void-border)] rounded overflow-hidden cursor-pointer transition-all hover:border-[var(--void-border-hover)] hover:bg-[var(--void-surface-hover)]"
    >
      {/* Cover */}
      <div className="aspect-[3/4] bg-[var(--void-bg)] relative overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--accent-primary)] to-[var(--void-bg)]">
            <span className="text-4xl font-bold text-white/20">
              {book.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Completed badge */}
        {book.status === 'completed' && (
          <div className="absolute top-2 right-2 bg-[var(--accent-success)] text-white text-xs px-2 py-0.5 rounded font-medium">
            DONE
          </div>
        )}
        
        {/* More menu button */}
        <div className="absolute top-2 left-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1 rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {/* Dropdown menu */}
          {showMenu && (
            <div 
              className="absolute top-8 left-0 bg-[var(--void-surface)] border border-[var(--void-border)] rounded shadow-lg z-10 min-w-32"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={async () => {
                  await updateProgress(book.id, 0)
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--void-surface-hover)] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Progress
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Delete "${book.title}"? This cannot be undone.`)) {
                    await removeBook(book.id)
                  }
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--accent-danger)] hover:bg-[var(--void-surface-hover)] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Book
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm truncate" title={book.title}>
          {book.title}
        </h3>
        
        {book.author && (
          <p className="text-xs text-[var(--void-text-muted)] truncate mt-0.5">
            {book.author}
          </p>
        )}
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-1 bg-[var(--void-border)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                book.percentComplete >= 100
                  ? 'bg-[var(--accent-success)]'
                  : 'bg-[var(--accent-primary)]'
              }`}
              style={{ width: `${book.percentComplete}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs font-mono text-[var(--void-text-muted)]">
              {book.percentComplete}%
            </span>
            
            {book.totalReadingTime > 0 && (
              <span className="flex items-center gap-1 text-xs text-[var(--void-text-dim)]">
                <Clock className="w-3 h-3" />
                {formatTimeShort(book.totalReadingTime)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
