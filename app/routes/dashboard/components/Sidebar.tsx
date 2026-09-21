import { Logo } from './Logo'
import { SidebarRoutes } from './SidebarRoutes'

export function Sidebar() {
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r bg-white shadow-sm">
      <div className="flex h-[80px] items-center px-6">
        <Logo />
      </div>

      <div className="flex w-full flex-col">
        <SidebarRoutes />
      </div>
    </div>
  )
}
