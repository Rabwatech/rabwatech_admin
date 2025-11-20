import { AdminHeader } from './AdminHeader'
import { AdminNav } from './AdminNav'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-muted/40 md:flex md:flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-semibold">القائمة</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <AdminNav />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

