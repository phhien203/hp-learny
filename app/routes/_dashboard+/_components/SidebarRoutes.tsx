import { BarChart, Compass, Layout, List } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { SidebarItem } from './SidebarItem'

const guestRoutes = [
  // {
  //   icon: Layout,
  //   label: 'Dashboard',
  //   href: '/',
  // },
  {
    icon: Compass,
    label: 'Browse',
    href: '/search',
  },
]

const teacherRoutes = [
  {
    icon: List,
    label: 'Courses',
    href: '/teacher/courses',
  },
  {
    icon: BarChart,
    label: 'Analytics',
    href: '/teacher/analytics',
  },
]

export function SidebarRoutes() {
  const location = useLocation()
  const isTeacherPage = location.pathname.includes('/teacher')

  const routes = isTeacherPage ? teacherRoutes : guestRoutes

  return (
    <div className="flex w-full flex-col">
      {routes.map((route) => (
        <SidebarItem key={route.href} {...route} />
      ))}
    </div>
  )
}
