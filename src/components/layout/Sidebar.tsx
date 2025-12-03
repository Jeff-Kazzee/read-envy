import { LayoutDashboard, Library, Target, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'

type View = 'dashboard' | 'library' | 'goals' | 'settings'

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'library', label: 'Library', icon: <Library className="w-5 h-5" /> },
  { id: 'goals', label: 'Goals', icon: <Target className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
]

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-[var(--sidebar-width)] border-r border-[var(--void-border)] bg-[var(--void-surface)] flex flex-col">
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors',
                  currentView === item.id
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--void-text-muted)] hover:bg-[var(--void-surface-hover)] hover:text-[var(--void-text)]'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-[var(--void-border)]">
        <p className="text-xs text-[var(--void-text-dim)] text-center">
          Read-Envy v0.1.0
        </p>
      </div>
    </aside>
  )
}
