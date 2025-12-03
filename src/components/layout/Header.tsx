import { Flame, BookOpen, Search } from 'lucide-react'
import { useGoalsStore } from '../../stores/useGoalsStore'
import { useLibraryStore } from '../../stores/useLibraryStore'

export function Header() {
  const { currentStreak, todayPagesRead, dailyPageGoal, getDailyProgress } = useGoalsStore()
  const { searchQuery, setSearchQuery } = useLibraryStore()
  const progress = getDailyProgress()
  
  return (
    <header className="h-14 border-b border-[var(--void-border)] bg-[var(--void-surface)] flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-[var(--accent-primary)]" />
        <span className="font-semibold text-lg tracking-tight">Read-Envy</span>
      </div>
      
      {/* Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--void-text-dim)]" />
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--void-bg)] border border-[var(--void-border)] rounded px-9 py-1.5 text-sm placeholder:text-[var(--void-text-dim)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-6">
        {/* Daily Progress */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-[var(--void-text-muted)] font-mono">
            {todayPagesRead}/{dailyPageGoal} pages
          </div>
          <div className="w-20 h-1.5 bg-[var(--void-border)] rounded-full overflow-hidden">
            <div 
              className={`h-full bg-[var(--accent-primary)] transition-all duration-500 ${progress >= 100 ? 'progress-glow' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Streak */}
        {currentStreak > 0 && (
          <div className="flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-[var(--accent-streak)] streak-fire" />
            <span className="font-mono font-medium text-[var(--accent-streak)]">
              {currentStreak}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
