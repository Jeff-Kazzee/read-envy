import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize, Minimize, List, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react'
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

// Outline item interface
interface OutlineItem {
  title: string
  pageNumber: number
  items: OutlineItem[]
}

interface PDFReaderProps {
  book: Book
  onClose: () => void
}

// Outline Tree Component
interface OutlineTreeProps {
  items: OutlineItem[]
  currentPage: number
  expandedItems: Set<string>
  onToggleExpand: (key: string) => void
  onNavigate: (page: number) => void
  depth?: number
}

function OutlineTree({ items, currentPage, expandedItems, onToggleExpand, onNavigate, depth = 0 }: OutlineTreeProps) {
  return (
    <ul className={depth === 0 ? '' : 'ml-3 border-l border-(--void-border)'}>
      {items.map((item, index) => {
        const key = `${depth}-${index}-${item.title}`
        const hasChildren = item.items && item.items.length > 0
        const isExpanded = expandedItems.has(key)
        const isActive = item.pageNumber === currentPage
        
        return (
          <li key={key}>
            <div className="flex items-center">
              {/* Expand/collapse button for items with children */}
              {hasChildren ? (
                <button
                  onClick={() => onToggleExpand(key)}
                  className="p-1 hover:bg-(--void-surface-hover) rounded shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-(--void-text-dim)" />
                  ) : (
                    <ChevronRightIcon className="w-3 h-3 text-(--void-text-dim)" />
                  )}
                </button>
              ) : (
                <span className="w-5" /> // Spacer for alignment
              )}
              
              {/* Title button */}
              <button
                onClick={() => onNavigate(item.pageNumber)}
                className={`flex-1 text-left px-2 py-1 text-sm rounded truncate transition-colors ${
                  isActive 
                    ? 'bg-(--accent-primary) text-white' 
                    : 'hover:bg-(--void-surface-hover) text-(--void-text)'
                }`}
                title={`${item.title} (Page ${item.pageNumber})`}
              >
                {item.title}
              </button>
              
              {/* Page number */}
              <span className="text-xs text-(--void-text-dim) px-2 shrink-0">
                {item.pageNumber}
              </span>
            </div>
            
            {/* Children */}
            {hasChildren && isExpanded && (
              <OutlineTree
                items={item.items}
                currentPage={currentPage}
                expandedItems={expandedItems}
                onToggleExpand={onToggleExpand}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function PDFReader({ book, onClose }: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(book.totalPages)
  const [currentPage, setCurrentPage] = useState<number>(book.currentPage || 1)
  const [scale, setScale] = useState<number>(1.0)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [showOutline, setShowOutline] = useState<boolean>(false)
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null)
  
  const { updateProgress } = useLibraryStore()
  const { refreshTodayProgress } = useGoalsStore()
  
  // Toggle outline sidebar
  const toggleOutline = useCallback(() => {
    setShowOutline(prev => !prev)
  }, [])
  
  // Toggle expanded state for outline items with children
  const toggleExpanded = useCallback((key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])
  
  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }, [])
  
  // Listen for fullscreen changes (e.g., user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])
  
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
  
  // Convert blob to Uint8Array for react-pdf (ArrayBuffer gets detached, Uint8Array is safer)
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null)
  
  useEffect(() => {
    let cancelled = false
    
    const loadPdf = async () => {
      try {
        const arrayBuffer = await book.pdfBlob.arrayBuffer()
        // Create a copy as Uint8Array to prevent detachment issues
        const uint8Array = new Uint8Array(arrayBuffer)
        if (!cancelled) {
          setPdfData(uint8Array)
        }
      } catch (error) {
        console.error('Failed to load PDF data:', error)
      }
    }
    
    loadPdf()
    
    return () => {
      cancelled = true
    }
  }, [book.pdfBlob])
  
  // Memoize file prop to prevent unnecessary reloads
  const file = useMemo(() => {
    if (!pdfData) return null
    return { data: pdfData }
  }, [pdfData])
  
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
        if (isFullscreen) {
          document.exitFullscreen()
        } else {
          onClose()
        }
      } else if (e.key === '+' || e.key === '=') {
        zoomIn()
      } else if (e.key === '-') {
        zoomOut()
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      } else if (e.key === 't' || e.key === 'T') {
        toggleOutline()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextPage, goToPrevPage, zoomIn, zoomOut, onClose, toggleFullscreen, isFullscreen, toggleOutline])
  
  // Load PDF outline when pdfData is ready
  useEffect(() => {
    if (!pdfData) return
    
    const loadOutline = async () => {
      try {
        // Create a copy of the data to avoid detachment issues
        const dataCopy = new Uint8Array(pdfData)
        
        // Load PDF document directly using pdfjs
        const loadingTask = pdfjs.getDocument({ data: dataCopy })
        const pdfDoc = await loadingTask.promise
        pdfDocRef.current = pdfDoc
        
        const pdfOutline = await pdfDoc.getOutline()
        if (pdfOutline && pdfOutline.length > 0) {
          // Convert PDF outline to our format with page numbers
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const convertOutline = async (items: any[]): Promise<OutlineItem[]> => {
            const result: OutlineItem[] = []
            
            for (const item of items) {
              let pageNumber = 1
              
              // Get page number from destination
              if (item.dest) {
                try {
                  let destArray = item.dest
                  if (typeof destArray === 'string') {
                    destArray = await pdfDoc.getDestination(destArray)
                  }
                  if (destArray && destArray[0]) {
                    const pageRef = destArray[0]
                    const pageIndex = await pdfDoc.getPageIndex(pageRef)
                    pageNumber = pageIndex + 1 // Convert 0-indexed to 1-indexed
                  }
                } catch {
                  // Fallback to page 1 if destination parsing fails
                }
              }
              
              const children = item.items ? await convertOutline(item.items) : []
              
              result.push({
                title: item.title,
                pageNumber,
                items: children,
              })
            }
            
            return result
          }
          
          const convertedOutline = await convertOutline(pdfOutline)
          console.log('Converted Outline:', convertedOutline) // Debug log
          setOutline(convertedOutline)
        } else {
          console.log('No outline found in PDF')
          setOutline([])
        }
      } catch (error) {
        console.error('Failed to extract PDF outline:', error)
      }
    }
    
    loadOutline()
  }, [pdfData])
  
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
    <div className="fixed inset-0 z-50 bg-(--void-bg) flex flex-col">
      {/* Header */}
      <header className="h-14 bg-(--void-surface) border-b border-(--void-border) flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-(--void-surface-hover) transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Table of Contents toggle */}
          <button
            onClick={toggleOutline}
            className={`p-2 rounded transition-colors ${showOutline ? 'bg-(--accent-primary) text-white' : 'hover:bg-(--void-surface-hover)'}`}
            title="Table of Contents (T)"
          >
            <List className="w-5 h-5" />
          </button>
          
          <div className="truncate max-w-md">
            <h1 className="font-medium truncate">{book.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            className="p-2 rounded hover:bg-(--void-surface-hover) transition-colors"
            title="Zoom out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm font-mono w-16 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="p-2 rounded hover:bg-(--void-surface-hover) transition-colors"
            title="Zoom in (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-(--void-border) mx-2" />
          
          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded hover:bg-(--void-surface-hover) transition-colors"
            title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          
          <div className="w-px h-6 bg-(--void-border) mx-2" />
          
          {/* Page indicator */}
          <span className="text-sm font-mono">
            {currentPage} / {numPages}
          </span>
        </div>
      </header>
      
      {/* Main content area with optional sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table of Contents Sidebar */}
        {showOutline && (
          <aside className="w-64 bg-(--void-surface) border-r border-(--void-border) flex flex-col shrink-0 overflow-hidden">
            <div className="p-3 border-b border-(--void-border)">
              <h2 className="text-sm font-medium text-(--void-text-muted)">Table of Contents</h2>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {outline.length === 0 ? (
                <p className="text-sm text-(--void-text-dim) p-2">No table of contents available</p>
              ) : (
                <OutlineTree 
                  items={outline} 
                  currentPage={currentPage}
                  expandedItems={expandedItems}
                  onToggleExpand={toggleExpanded}
                  onNavigate={(page) => setCurrentPage(page)}
                />
              )}
            </div>
          </aside>
        )}
        
        {/* PDF Content */}
        <div className="flex-1 overflow-auto flex justify-center p-4 bg-(--void-bg)">
          {!file ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-(--void-text-muted)">Loading PDF...</p>
            </div>
          ) : (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-full">
                <p className="text-(--void-text-muted)">Loading PDF...</p>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-full">
                <p className="text-(--accent-danger)">Failed to load PDF</p>
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
          )}
        </div>
      </div>
      
      {/* Footer with navigation */}
      <footer className="h-16 bg-(--void-surface) border-t border-(--void-border) flex items-center justify-between px-4 shrink-0">
        {/* Progress bar */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-(--void-border) rounded-full overflow-hidden">
              <div
                className="h-full bg-(--accent-primary) transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <span className="text-sm font-mono text-(--void-text-muted) w-12">
              {percentComplete}%
            </span>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="p-3 rounded bg-(--void-surface-hover) hover:bg-(--void-border) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
            className="w-16 bg-(--void-bg) border border-(--void-border) rounded px-2 py-1 text-center font-mono focus:border-(--accent-primary) focus:outline-none"
          />
          
          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className="p-3 rounded bg-(--void-surface-hover) hover:bg-(--void-border) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
