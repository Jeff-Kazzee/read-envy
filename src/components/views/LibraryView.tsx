import { BookGrid } from '../library/BookGrid'

interface LibraryViewProps {
  onBookClick: (bookId: string) => void
}

export function LibraryView({ onBookClick }: LibraryViewProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Library</h1>
      <BookGrid onBookClick={onBookClick} />
    </div>
  )
}
