# Read-Envy 📚

**Transform your PDF graveyard into active learning.**

Read-Envy is a web application that helps learners systematically track, manage, and complete their PDF-based educational reading. Stop hoarding PDFs — start finishing them.

![Read-Envy Dashboard](https://via.placeholder.com/800x450?text=Read-Envy+Dashboard)

## Features

- **📥 PDF Import** — Drag-and-drop upload with automatic metadata extraction
- **📊 Progress Tracking** — Track page position, percentage complete, and time spent
- **🎯 Reading Goals** — Set daily page targets and maintain reading streaks
- **🔥 Streak Counter** — Stay motivated with consecutive day tracking
- **📚 Library Grid** — Visual book grid with search, filter, and sort
- **⚡ Quick-Log Modal** — Update progress in seconds without leaving your flow
- **🌙 Void Theme** — Dark, high-contrast "Academic Arsenal" aesthetic

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** — Utility-first styling
- **Zustand** — Lightweight state management
- **Dexie.js** — IndexedDB wrapper for local persistence
- **pdf.js** — PDF metadata extraction and thumbnail generation
- **Lucide React** — Beautiful icons

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── layout/         # Header, Sidebar
│   ├── library/        # BookCard, BookGrid, ImportDropzone, QuickLogModal
│   └── views/          # DashboardView, LibraryView, GoalsView
├── stores/             # Zustand stores (library, goals)
├── lib/                # Database, PDF utils, helpers
├── types/              # TypeScript interfaces
└── App.tsx             # Main app component
```

## Deployment

This app is designed to be deployed on **Vercel**:

```bash
# Deploy to Vercel
npx vercel
```

## License

MIT
