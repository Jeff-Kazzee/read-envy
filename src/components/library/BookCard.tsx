import { useMemo } from 'react'
import { Clock, MoreVertical } from 'lucide-react'
import type { Book } from '../../types'
import { formatTimeShort } from '../../lib/utils'

interface BookCardProps {
  book: Book
  onClick: () => void
}

export function BookCard({ book, onClick }: BookCardProps) {
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
        <button
          onClick={(e) => {
            e.stopPropagation()
            // TODO: Open context menu
          }}
          className="absolute top-2 left-2 p-1 rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
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
