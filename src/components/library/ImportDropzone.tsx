import { useState, useCallback } from 'react'
import { Upload, FileWarning, Loader2 } from 'lucide-react'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { validatePDFFile, extractPDFMetadata, generateCoverThumbnail } from '../../lib/pdf-utils'

export function ImportDropzone() {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { importBook } = useLibraryStore()
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])
  
  const processFile = useCallback(async (file: File) => {
    setError(null)
    
    // Validate
    const validation = validatePDFFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Extract metadata
      const metadata = await extractPDFMetadata(file)
      
      // Generate cover thumbnail
      const coverThumbnail = await generateCoverThumbnail(file)
      
      // Import book
      await importBook(file, {
        title: metadata.title,
        author: metadata.author,
        totalPages: metadata.totalPages,
        coverThumbnail,
      })
      
      setError(null)
    } catch (err) {
      console.error('Failed to import PDF:', err)
      setError('Failed to process PDF. The file may be corrupted.')
    } finally {
      setIsProcessing(false)
    }
  }, [importBook])
  
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
    
    if (pdfFile) {
      await processFile(pdfFile)
    } else {
      setError('Please drop a PDF file')
    }
  }, [processFile])
  
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processFile(file)
    }
    // Reset input
    e.target.value = ''
  }, [processFile])
  
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center transition-all
        ${isDragging 
          ? 'border-(--accent-primary) bg-(--accent-primary)/10' 
          : 'border-(--void-border) hover:border-(--void-border-hover)'
        }
        ${isProcessing ? 'pointer-events-none opacity-50' : ''}
      `}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center gap-3">
        {isProcessing ? (
          <>
            <Loader2 className="w-10 h-10 text-(--accent-primary) animate-spin" />
            <p className="text-sm text-(--void-text-muted)">Processing PDF...</p>
          </>
        ) : error ? (
          <>
            <FileWarning className="w-10 h-10 text-(--accent-danger)" />
            <p className="text-sm text-(--accent-danger)">{error}</p>
            <p className="text-xs text-(--void-text-dim)">Try another file</p>
          </>
        ) : (
          <>
            <Upload className={`w-10 h-10 ${isDragging ? 'text-(--accent-primary)' : 'text-(--void-text-dim)'}`} />
            <div>
              <p className="text-sm font-medium">
                {isDragging ? 'Drop to import' : 'Drag & drop a PDF'}
              </p>
              <p className="text-xs text-(--void-text-dim) mt-1">
                or click to browse (max 100MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
