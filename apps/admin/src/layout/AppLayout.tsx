import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        {/* Elevated surface — creates depth vs sidebar */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: 'var(--surface-1)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
