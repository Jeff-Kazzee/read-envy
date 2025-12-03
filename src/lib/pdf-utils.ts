import * as pdfjsLib from 'pdfjs-dist'

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface PDFMetadata {
  title: string
  author?: string
  totalPages: number
}

export async function extractPDFMetadata(file: File): Promise<PDFMetadata> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  
  const metadata = await pdf.getMetadata()
  const info = metadata.info as Record<string, unknown>
  
  // Try to get title from metadata, fallback to filename
  let title = (info?.Title as string) || ''
  if (!title) {
    title = file.name.replace(/\.pdf$/i, '')
  }
  
  const author = (info?.Author as string) || undefined
  
  return {
    title,
    author,
    totalPages: pdf.numPages,
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
