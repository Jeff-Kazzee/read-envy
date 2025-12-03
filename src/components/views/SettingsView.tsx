import { useState } from 'react'
import { RotateCcw, AlertTriangle, Database } from 'lucide-react'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useGoalsStore } from '../../stores/useGoalsStore'
import { db } from '../../lib/db'

export function SettingsView() {
  const [isResetting, setIsResetting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const { books, loadBooks } = useLibraryStore()
  const { loadGoals } = useGoalsStore()
  
  const handleResetAllProgress = async () => {
    if (!confirm('Reset progress for ALL books? This will set all books back to page 0. This cannot be undone.')) {
      return
    }
    
    setIsResetting(true)
    try {
      // Reset all books to page 0
      for (const book of books) {
        await db.books.update(book.id, {
          currentPage: 0,
          percentComplete: 0,
          totalReadingTime: 0,
          status: 'active',
          lastReadAt: undefined,
        })
      }
      
      // Clear all reading sessions
      await db.sessions.clear()
      
      // Reload data
      await loadBooks()
      await loadGoals()
      
      alert('All progress has been reset.')
    } catch (error) {
      console.error('Failed to reset progress:', error)
      alert('Failed to reset progress. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }
  
  const handleClearLibrary = async () => {
    if (!confirm('DELETE ALL BOOKS AND DATA? This will permanently remove everything. This cannot be undone!')) {
      return
    }
    
    // Double confirmation for destructive action
    if (!confirm('Are you ABSOLUTELY sure? Type "delete" in the next prompt to confirm.')) {
      return
    }
    
    const confirmation = prompt('Type "delete" to confirm:')
    if (confirmation?.toLowerCase() !== 'delete') {
      alert('Deletion cancelled.')
      return
    }
    
    setIsClearing(true)
    try {
      // Clear all tables
      await db.books.clear()
      await db.sessions.clear()
      await db.goals.clear()
      await db.streaks.clear()
      
      // Reload data
      await loadBooks()
      await loadGoals()
      
      alert('All data has been deleted.')
    } catch (error) {
      console.error('Failed to clear library:', error)
      alert('Failed to clear library. Please try again.')
    } finally {
      setIsClearing(false)
    }
  }
  
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {/* Data Management Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Management
        </h2>
        
        <div className="space-y-4">
          {/* Reset Progress */}
          <div className="bg-[var(--void-surface)] border border-[var(--void-border)] rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset All Progress
                </h3>
                <p className="text-sm text-[var(--void-text-muted)] mt-1">
                  Set all books back to page 0 and clear reading history. Books will remain in your library.
                </p>
              </div>
              <button
                onClick={handleResetAllProgress}
                disabled={isResetting || books.length === 0}
                className="px-4 py-2 bg-[var(--accent-warning)] text-black rounded font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
              >
                {isResetting ? 'Resetting...' : 'Reset Progress'}
              </button>
            </div>
          </div>
          
          {/* Clear Library */}
          <div className="bg-[var(--void-surface)] border border-[var(--accent-danger)]/30 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium flex items-center gap-2 text-[var(--accent-danger)]">
                  <AlertTriangle className="w-4 h-4" />
                  Delete All Data
                </h3>
                <p className="text-sm text-[var(--void-text-muted)] mt-1">
                  Permanently delete all books, reading history, goals, and streaks. This cannot be undone.
                </p>
              </div>
              <button
                onClick={handleClearLibrary}
                disabled={isClearing || books.length === 0}
                className="px-4 py-2 bg-[var(--accent-danger)] text-white rounded font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
              >
                {isClearing ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Storage Info */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Storage</h2>
        <div className="bg-[var(--void-surface)] border border-[var(--void-border)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--void-text-muted)]">Books in library</span>
            <span className="font-mono">{books.length}</span>
          </div>
          <p className="text-xs text-[var(--void-text-dim)] mt-3">
            All data is stored locally in your browser using IndexedDB. Clearing browser data will delete your library.
          </p>
        </div>
      </section>
      
      {/* About */}
      <section>
        <h2 className="text-lg font-semibold mb-4">About</h2>
        <div className="bg-[var(--void-surface)] border border-[var(--void-border)] rounded-lg p-4">
          <h3 className="font-bold text-lg">Read-Envy</h3>
          <p className="text-sm text-[var(--void-text-muted)] mt-1">
            Transform your PDF graveyard into active learning.
          </p>
          <p className="text-xs text-[var(--void-text-dim)] mt-3">
            Version 1.0.0 MVP
          </p>
        </div>
      </section>
    </div>
  )
}
