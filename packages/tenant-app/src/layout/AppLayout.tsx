import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ImpersonationBanner } from '@/shared/components/ImpersonationBanner'

export function AppLayout() {
  return (
    <div className="flex flex-col h-screen bg-surface-0 overflow-hidden">
      <ImpersonationBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-canvas">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
