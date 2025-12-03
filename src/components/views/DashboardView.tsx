import { useMemo } from 'react'
import { BookOpen, Flame, Clock, TrendingUp } from 'lucide-react'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useGoalsStore } from '../../stores/useGoalsStore'
import { formatTimeShort } from '../../lib/utils'

interface DashboardViewProps {
  onBookClick: (bookId: string) => void
}

export function DashboardView({ onBookClick }: DashboardViewProps) {
  const { books, getLastReadBook } = useLibraryStore()
  const { currentStreak, longestStreak, todayPagesRead, dailyPageGoal, getDailyProgress } = useGoalsStore()
  
  const lastReadBook = getLastReadBook()
  const progress = getDailyProgress()
  
  // Calculate stats
  const stats = useMemo(() => {
    const activeBooks = books.filter(b => b.status === 'active').length
    const completedBooks = books.filter(b => b.status === 'completed').length
    const totalPages = books.reduce((sum, b) => sum + b.currentPage, 0)
    const totalTime = books.reduce((sum, b) => sum + b.totalReadingTime, 0)
    
    return { activeBooks, completedBooks, totalPages, totalTime }
  }, [books])
  
  const coverUrl = useMemo(() => {
    if (lastReadBook?.coverThumbnail) {
      return URL.createObjectURL(lastReadBook.coverThumbnail)
    }
    return null
  }, [lastReadBook?.coverThumbnail])
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Continue Reading Card */}
      {lastReadBook && (
        <div 
          onClick={() => onBookClick(lastReadBook.id)}
          className="bg-(--void-surface) border border-(--void-border) rounded-lg p-4 cursor-pointer hover:border-(--void-border-hover) transition-colors"
        >
          <h2 className="text-sm font-medium text-(--void-text-muted) mb-3">Continue Reading</h2>
          <div className="flex gap-4">
            {/* Cover */}
            <div className="w-16 h-20 rounded overflow-hidden bg-(--void-bg) flex-shrink-0">
              {coverUrl ? (
                <img src={coverUrl} alt={lastReadBook.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-(--accent-primary) to-(--void-bg)">
                  <span className="text-xl font-bold text-white/20">
                    {lastReadBook.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{lastReadBook.title}</h3>
              <p className="text-sm text-(--void-text-muted)">
                Page {lastReadBook.currentPage} of {lastReadBook.totalPages}
              </p>
              
              {/* Progress bar */}
              <div className="mt-2">
                <div className="h-1.5 bg-(--void-border) rounded-full overflow-hidden">
                  <div
                    className="h-full bg-(--accent-primary) transition-all"
                    style={{ width: `${lastReadBook.percentComplete}%` }}
                  />
                </div>
              </div>
              
              {/* Pages to goal */}
              {dailyPageGoal > 0 && todayPagesRead < dailyPageGoal && (
                <p className="text-xs text-(--accent-primary) mt-2">
                  {dailyPageGoal - todayPagesRead} pages to daily goal
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Daily Progress */}
        <div className="bg-(--void-surface) border border-(--void-border) rounded-lg p-4">
          <div className="flex items-center gap-2 text-(--void-text-muted) mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Today</span>
          </div>
          <div className="text-2xl font-bold font-mono">{todayPagesRead}</div>
          <div className="text-xs text-(--void-text-dim)">/ {dailyPageGoal} pages</div>
          <div className="mt-2 h-1 bg-(--void-border) rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${progress >= 100 ? 'bg-(--accent-success)' : 'bg-(--accent-primary)'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Streak */}
        <div className="bg-(--void-surface) border border-(--void-border) rounded-lg p-4">
          <div className="flex items-center gap-2 text-(--void-text-muted) mb-2">
            <Flame className="w-4 h-4 text-(--accent-streak)" />
            <span className="text-xs">Streak</span>
          </div>
          <div className="text-2xl font-bold font-mono text-(--accent-streak)">{currentStreak}</div>
          <div className="text-xs text-(--void-text-dim)">days</div>
          {longestStreak > currentStreak && (
            <div className="text-xs text-(--void-text-dim) mt-1">Best: {longestStreak}</div>
          )}
        </div>
        
        {/* Active Books */}
        <div className="bg-(--void-surface) border border-(--void-border) rounded-lg p-4">
          <div className="flex items-center gap-2 text-(--void-text-muted) mb-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs">Active</span>
          </div>
          <div className="text-2xl font-bold font-mono">{stats.activeBooks}</div>
          <div className="text-xs text-(--void-text-dim)">{stats.completedBooks} completed</div>
        </div>
        
        {/* Total Time */}
        <div className="bg-(--void-surface) border border-(--void-border) rounded-lg p-4">
          <div className="flex items-center gap-2 text-(--void-text-muted) mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Total Time</span>
          </div>
          <div className="text-2xl font-bold font-mono">{formatTimeShort(stats.totalTime)}</div>
          <div className="text-xs text-(--void-text-dim)">{stats.totalPages} pages read</div>
        </div>
      </div>
      
      {/* Empty state */}
      {books.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-(--void-text-dim) mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Welcome to Read-Envy</h3>
          <p className="text-sm text-(--void-text-muted) max-w-sm mx-auto">
            Import your first PDF from the Library to start tracking your reading progress.
          </p>
        </div>
      )}
    </div>
  )
}
