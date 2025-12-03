import { useState, useEffect, useCallback } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardView } from './components/views/DashboardView'
import { LibraryView } from './components/views/LibraryView'
import { GoalsView } from './components/views/GoalsView'
import { SettingsView } from './components/views/SettingsView'
import { PDFReader } from './components/reader/PDFReader'
import { useLibraryStore } from './stores/useLibraryStore'
import { useGoalsStore } from './stores/useGoalsStore'

type View = 'dashboard' | 'library' | 'goals' | 'settings'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  
  const { books, loadBooks } = useLibraryStore()
  const { loadGoals } = useGoalsStore()
  
  // Load data on mount
  useEffect(() => {
    loadBooks()
    loadGoals()
  }, [loadBooks, loadGoals])
  
  const selectedBook = selectedBookId ? books.find(b => b.id === selectedBookId) : null
  
  const handleBookClick = useCallback((bookId: string) => {
    setSelectedBookId(bookId)
  }, [])
  
  const handleCloseModal = useCallback(() => {
    setSelectedBookId(null)
  }, [])
  
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onBookClick={handleBookClick} />
      case 'library':
        return <LibraryView onBookClick={handleBookClick} />
      case 'goals':
        return <GoalsView />
      case 'settings':
        return <SettingsView />
      default:
        return null
    }
  }
  
  return (
    <div className="h-screen flex flex-col bg-[var(--void-bg)]">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        
        <main className="flex-1 overflow-auto p-6">
          {renderView()}
        </main>
      </div>
      
      {/* PDF Reader */}
      {selectedBook && (
        <PDFReader book={selectedBook} onClose={handleCloseModal} />
      )}
    </div>
  )
}

export default App
