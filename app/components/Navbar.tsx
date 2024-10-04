import { NavbarRoutes } from '~/components/NavbarRoutes'
import { MobileSidebar } from './MobileSidebar'

export function Navbar() {
  return (
    <div className="flex h-full items-center border-b bg-white p-4 shadow-sm">
      <MobileSidebar />
      <NavbarRoutes />
    </div>
  )
}
