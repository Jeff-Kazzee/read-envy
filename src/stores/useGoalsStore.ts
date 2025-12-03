import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Goal } from '../types'
import { getGoals, setGoal, getStreakData, updateStreakData, getTodaySessions } from '../lib/db'

interface GoalsState {
  dailyPageGoal: number
  currentStreak: number
  longestStreak: number
  todayPagesRead: number
  isLoading: boolean
  
  // Actions
  loadGoals: () => Promise<void>
  setDailyGoal: (pages: number) => Promise<void>
  refreshTodayProgress: () => Promise<void>
  checkAndUpdateStreak: () => Promise<void>
  
  // Computed
  getDailyProgress: () => number // 0-100
  isGoalMet: () => boolean
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  dailyPageGoal: 20, // Default goal
  currentStreak: 0,
  longestStreak: 0,
  todayPagesRead: 0,
  isLoading: true,
  
  loadGoals: async () => {
    set({ isLoading: true })
    try {
      // Load goals
      const goals = await getGoals()
      const dailyGoal = goals.find((g) => g.type === 'daily_pages')
      
      // Load streak data
      const streakData = await getStreakData()
      
      // Load today's progress
      const todaySessions = await getTodaySessions()
      const todayPagesRead = todaySessions.reduce((sum, s) => sum + s.pagesRead, 0)
      
      set({
        dailyPageGoal: dailyGoal?.target ?? 20,
        currentStreak: streakData?.currentStreak ?? 0,
        longestStreak: streakData?.longestStreak ?? 0,
        todayPagesRead,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to load goals:', error)
      set({ isLoading: false })
    }
  },
  
  setDailyGoal: async (pages) => {
    const goal: Goal = {
      id: uuidv4(),
      type: 'daily_pages',
      target: pages,
      createdAt: new Date().toISOString(),
    }
    await setGoal(goal)
    set({ dailyPageGoal: pages })
  },
  
  refreshTodayProgress: async () => {
    const todaySessions = await getTodaySessions()
    const todayPagesRead = todaySessions.reduce((sum, s) => sum + s.pagesRead, 0)
    set({ todayPagesRead })
    
    // Check if we should update streak
    await get().checkAndUpdateStreak()
  },
  
  checkAndUpdateStreak: async () => {
    const { dailyPageGoal, todayPagesRead, currentStreak, longestStreak } = get()
    const today = new Date().toISOString().split('T')[0]
    
    const streakData = await getStreakData()
    const lastActiveDate = streakData?.lastActiveDate
    
    // If goal met today
    if (todayPagesRead >= dailyPageGoal) {
      let newStreak = currentStreak
      
      if (lastActiveDate !== today) {
        // Check if yesterday was active
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        
        if (lastActiveDate === yesterdayStr) {
          // Continuing streak
          newStreak = currentStreak + 1
        } else if (!lastActiveDate) {
          // First day
          newStreak = 1
        } else {
          // Streak broken, start fresh
          newStreak = 1
        }
        
        const newLongest = Math.max(longestStreak, newStreak)
        
        await updateStreakData({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: today,
        })
        
        set({
          currentStreak: newStreak,
          longestStreak: newLongest,
        })
      }
    }
  },
  
  getDailyProgress: () => {
    const { dailyPageGoal, todayPagesRead } = get()
    if (dailyPageGoal === 0) return 100
    return Math.min(100, Math.round((todayPagesRead / dailyPageGoal) * 100))
  },
  
  isGoalMet: () => {
    const { dailyPageGoal, todayPagesRead } = get()
    return todayPagesRead >= dailyPageGoal
  },
}))
