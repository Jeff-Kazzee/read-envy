import * as pdfjsLib from 'pdfjs-dist'

// Set worker source for pdfjs-dist v5
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export interface PDFMetadata {
  title: string
  author?: string
  totalPages: number
}

export async function extractPDFMetadata(file: File): Promise<PDFMetadata> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let title = file.name.replace(/\.pdf$/i, '')
    let author: string | undefined
    
    try {
      const metadata = await pdf.getMetadata()
      const info = metadata.info as Record<string, unknown>
      if (info?.Title) title = info.Title as string
      if (info?.Author) author = info.Author as string
    } catch {
      // Metadata extraction failed, use filename
      console.warn('Could not extract PDF metadata, using filename')
    }
    
    return {
      title,
      author,
      totalPages: pdf.numPages,
    }
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function generateCoverThumbnail(file: File, width = 150, height = 200): Promise<Blob | undefined> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const page = await pdf.getPage(1)
    
    const viewport = page.getViewport({ scale: 1 })
    const scale = Math.min(width / viewport.width, height / viewport.height)
    const scaledViewport = page.getViewport({ scale })
    
    const canvas = document.createElement('canvas')
    canvas.width = scaledViewport.width
    canvas.height = scaledViewport.height
    
    const context = canvas.getContext('2d')
    if (!context) return undefined
    
    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
      canvas,
    }).promise
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || undefined)
      }, 'image/jpeg', 0.8)
    })
  } catch (error) {
    console.error('Failed to generate cover thumbnail:', error)
    return undefined
  }
}

export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Only PDF files are supported.' }
  }
  
  // Check file size (100MB limit)
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'PDF must be under 100MB.' }
  }
  
  // Warn for large files
  const warnSize = 50 * 1024 * 1024
  if (file.size > warnSize) {
    console.warn('Large PDF file detected. Processing may take longer.')
  }
  
  return { valid: true }
}
