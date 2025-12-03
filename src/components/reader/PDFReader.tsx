import { useState, useEffect, useMemo, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import type { Book } from '../../types'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useGoalsStore } from '../../stores/useGoalsStore'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface PDFReaderProps {
  book: Book
  onClose: () => void
}

export function PDFReader({ book, onClose }: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(book.totalPages)
  const [currentPage, setCurrentPage] = useState<number>(book.currentPage || 1)
  const [scale, setScale] = useState<number>(1.0)
  
  const { updateProgress } = useLibraryStore()
  const { refreshTodayProgress } = useGoalsStore()
  
  // Navigation functions - defined before useEffect that uses them
  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, numPages))
  }, [numPages])
  
  const goToPrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }, [])
  
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }, [])
  
  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }, [])
  
  // Create object URL for the PDF blob
  const pdfUrl = useMemo(() => {
    return URL.createObjectURL(book.pdfBlob)
  }, [book.pdfBlob])
  
  // Cleanup URL on unmount
  useEffect(() => {
    return () => URL.revokeObjectURL(pdfUrl)
  }, [pdfUrl])
  
  // Save progress when page changes
  useEffect(() => {
    const saveProgress = async () => {
      if (currentPage !== book.currentPage) {
        await updateProgress(book.id, currentPage)
        await refreshTodayProgress()
      }
    }
    
    // Debounce save
    const timeout = setTimeout(saveProgress, 1000)
    return () => clearTimeout(timeout)
  }, [currentPage, book.id, book.currentPage, updateProgress, refreshTodayProgress])
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goToNextPage()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevPage()
      } else if (e.key === 'Escape') {
        onClose()
      } else if (e.key === '+' || e.key === '=') {
        zoomIn()
      } else if (e.key === '-') {
        zoomOut()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextPage, goToPrevPage, zoomIn, zoomOut, onClose])
  
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    // Start at saved page or page 1
    if (book.currentPage > 0 && book.currentPage <= numPages) {
      setCurrentPage(book.currentPage)
    } else {
      setCurrentPage(1)
    }
  }, [book.currentPage])
  
  const percentComplete = Math.round((currentPage / numPages) * 100)
  
  return (
    <div className="fixed inset-0 z-50 bg-[var(--void-bg)] flex flex-col">
      {/* Header */}
      <header className="h-14 bg-[var(--void-surface)] border-b border-[var(--void-border)] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-[var(--void-surface-hover)] transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="truncate max-w-md">
            <h1 className="font-medium truncate">{book.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            className="p-2 rounded hover:bg-[var(--void-surface-hover)] transition-colors"
            title="Zoom out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm font-mono w-16 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="p-2 rounded hover:bg-[var(--void-surface-hover)] transition-colors"
            title="Zoom in (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-[var(--void-border)] mx-2" />
          
          {/* Page indicator */}
          <span className="text-sm font-mono">
            {currentPage} / {numPages}
          </span>
        </div>
      </header>
      
      {/* PDF Content */}
      <div className="flex-1 overflow-auto flex justify-center p-4 bg-[var(--void-bg)]">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-full">
              <p className="text-[var(--void-text-muted)]">Loading PDF...</p>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-full">
              <p className="text-[var(--accent-danger)]">Failed to load PDF</p>
            </div>
          }
          className="max-w-full"
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            className="shadow-2xl"
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
      
      {/* Footer with navigation */}
      <footer className="h-16 bg-[var(--void-surface)] border-t border-[var(--void-border)] flex items-center justify-between px-4 shrink-0">
        {/* Progress bar */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[var(--void-border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-primary)] transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <span className="text-sm font-mono text-[var(--void-text-muted)] w-12">
              {percentComplete}%
            </span>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="p-3 rounded bg-[var(--void-surface-hover)] hover:bg-[var(--void-border)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous page (←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Page jump input */}
          <input
            type="number"
            min={1}
            max={numPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value, 10)
              if (page >= 1 && page <= numPages) {
                setCurrentPage(page)
              }
            }}
            className="w-16 bg-[var(--void-bg)] border border-[var(--void-border)] rounded px-2 py-1 text-center font-mono focus:border-[var(--accent-primary)] focus:outline-none"
          />
          
          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className="p-3 rounded bg-[var(--void-surface-hover)] hover:bg-[var(--void-border)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next page (→ or Space)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Spacer to balance layout */}
        <div className="flex-1 max-w-md" />
      </footer>
    </div>
  )
}
