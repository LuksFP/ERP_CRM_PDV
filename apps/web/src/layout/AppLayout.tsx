import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ImpersonationBanner } from '@/shared/components/ImpersonationBanner'
import { CommandPalette } from '@/shared/components/CommandPalette'

export function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false)

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-surface-0 overflow-hidden">
      <ImpersonationBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header onOpenCommandPalette={() => setCmdOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6 bg-canvas">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  )
}
