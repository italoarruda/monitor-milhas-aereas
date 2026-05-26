'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, LayoutDashboard, Route, User, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

const NAV = [
  { href: '/pesquisa',       label: 'Pesquisar Voos',    icon: Search },
  { href: '/dashboard',      label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/monitoramentos', label: 'Monitoramentos',    icon: Route },
  { href: '/alertas',        label: 'Alertas',           icon: Bell },
  { href: '/perfil',         label: 'Perfil',            icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
      <div className="flex items-center gap-2 border-b border-[var(--sidebar-border)] px-5 py-4">
        <span className="text-2xl">✈️</span>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-slate-100 leading-tight">Monitor Milhas</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">GOL · LATAM · Azul</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100',
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-[var(--sidebar-border)] px-5 py-3 flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-slate-500">Monitoramento diário</p>
        <ThemeToggle />
      </div>
    </aside>
  )
}
