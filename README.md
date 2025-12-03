# Read-Envy 📚

**Transform your PDF graveyard into active learning.**

Read-Envy is a web application that helps learners systematically track, manage, and complete their PDF-based educational reading. Stop hoarding PDFs — start finishing them.

## Features

- **📖 Built-in PDF Reader** — Read PDFs directly in the app with keyboard navigation
- **📥 PDF Import** — Drag-and-drop upload with automatic page count extraction
- **📊 Auto Progress Tracking** — Your reading position is saved automatically as you read
- **🎯 Reading Goals** — Set daily page targets and maintain reading streaks
- **🔥 Streak Counter** — Stay motivated with consecutive day tracking
- **📚 Library Grid** — Visual book grid with search, filter, and sort
- **🌙 Void Theme** — Dark, high-contrast "Academic Arsenal" aesthetic

## How It Works

### Storage (IndexedDB)

All your data is stored **locally in your browser** using IndexedDB. This means:

- ✅ **No account required** — Just open the app and start reading
- ✅ **Your PDFs stay private** — Files never leave your device
- ✅ **Works offline** — Once loaded, the app works without internet
- ✅ **Persistent** — Your books and progress remain saved between sessions

**Important:** Since data is stored in your browser:
- Clearing browser data will delete your library
- Data is specific to each browser/device
- Use the same browser to access your books

### Reading Flow

1. **Import** — Drag a PDF onto the Library page
2. **Read** — Click any book to open the full-screen reader
3. **Navigate** — Use arrow keys, spacebar, or click buttons
4. **Auto-save** — Your page position saves automatically every second
5. **Track** — Dashboard shows your progress, streaks, and stats

### Keyboard Shortcuts (Reader)

| Key | Action |
|-----|--------|
| `→` or `Space` | Next page |
| `←` | Previous page |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `Esc` | Close reader |

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** — Utility-first styling
- **Zustand** — Lightweight state management
- **Dexie.js** — IndexedDB wrapper for local persistence
- **react-pdf** — PDF rendering with pdf.js
- **Lucide React** — Beautiful icons

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Jeff-Kazzee/read-envy.git
cd read-envy

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deploys.

### Self-Hosting

The `dist/` folder after `npm run build` contains static files that can be served by any web server (Nginx, Apache, Netlify, GitHub Pages, etc.).

## Project Structure

```
src/
├── components/
│   ├── layout/         # Header, Sidebar
│   ├── library/        # BookCard, BookGrid, ImportDropzone
│   ├── reader/         # PDFReader (full-screen reader)
│   └── views/          # DashboardView, LibraryView, GoalsView
├── stores/
│   ├── useLibraryStore.ts   # Books, progress, sessions
│   └── useGoalsStore.ts     # Daily goals, streaks
├── lib/
│   ├── db.ts           # Dexie.js database schema
│   ├── pdf-utils.ts    # PDF metadata extraction
│   └── utils.ts        # Helper functions
├── types/
│   └── index.ts        # TypeScript interfaces
└── App.tsx             # Main app component
```

## Data Schema

Books are stored with the following structure:

```typescript
interface Book {
  id: string
  title: string
  author?: string
  totalPages: number
  currentPage: number
  percentComplete: number
  totalReadingTime: number  // seconds
  coverThumbnail?: Blob     // First page rendered as image
  pdfBlob: Blob             // The actual PDF file
  tags: string[]
  status: 'active' | 'archived' | 'completed'
  createdAt: string
  updatedAt: string
  lastReadAt?: string
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT
