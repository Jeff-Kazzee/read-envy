import { useState } from 'react'
import { Target, Flame } from 'lucide-react'
import { useGoalsStore } from '../../stores/useGoalsStore'

export function GoalsView() {
  const { dailyPageGoal, currentStreak, longestStreak, todayPagesRead, setDailyGoal, getDailyProgress } = useGoalsStore()
  const [newGoal, setNewGoal] = useState(dailyPageGoal.toString())
  const [isSaving, setIsSaving] = useState(false)
  const progress = getDailyProgress()
  
  const handleSaveGoal = async () => {
    const goal = parseInt(newGoal, 10)
    if (isNaN(goal) || goal < 1) return
    
    setIsSaving(true)
    try {
      await setDailyGoal(goal)
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Goals</h1>
      
      {/* Daily Goal Setting */}
      <div className="bg-(--void-surface) border border-(--void-border) rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-(--accent-primary)" />
          <h2 className="text-lg font-medium">Daily Reading Goal</h2>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <input
            type="number"
            min={1}
            max={500}
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            className="w-24 bg-(--void-bg) border border-(--void-border) rounded px-3 py-2 text-lg font-mono text-center focus:border-(--accent-primary) focus:outline-none"
          />
          <span className="text-(--void-text-muted)">pages per day</span>
          <button
            onClick={handleSaveGoal}
            disabled={isSaving || parseInt(newGoal, 10) === dailyPageGoal}
            className="px-4 py-2 bg-(--accent-primary) text-white rounded hover:bg-(--accent-primary-hover) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
        
        {/* Today's Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-(--void-text-muted)">Today's Progress</span>
            <span className="font-mono">{todayPagesRead} / {dailyPageGoal} pages</span>
          </div>
          <div className="h-3 bg-(--void-border) rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                progress >= 100 ? 'bg-(--accent-success) progress-glow' : 'bg-(--accent-primary)'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress >= 100 && (
            <p className="text-sm text-(--accent-success)">🎉 Goal achieved!</p>
          )}
        </div>
      </div>
      
      {/* Streak Stats */}
      <div className="bg-(--void-surface) border border-(--void-border) rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-(--accent-streak)" />
          <h2 className="text-lg font-medium">Reading Streak</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-4xl font-bold font-mono text-(--accent-streak)">
              {currentStreak}
            </div>
            <div className="text-sm text-(--void-text-muted)">Current Streak</div>
          </div>
          <div>
            <div className="text-4xl font-bold font-mono text-(--void-text-muted)">
              {longestStreak}
            </div>
            <div className="text-sm text-(--void-text-muted)">Longest Streak</div>
          </div>
        </div>
        
        <p className="text-sm text-(--void-text-dim) mt-4">
          Read at least {dailyPageGoal} pages each day to maintain your streak.
        </p>
      </div>
    </div>
  )
}
