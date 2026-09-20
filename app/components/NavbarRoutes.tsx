import { UserButton } from '@clerk/remix'
import { LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router';
import { Button } from './ui/button'

export function NavbarRoutes({ isTeacher }: { isTeacher: boolean }) {
  const location = useLocation()

  const isTeacherPage = location.pathname.startsWith('/teacher')
  const isCoursePage = location.pathname.includes('/courses')
  const isSearchPage = location.pathname.includes('/search')

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">{/* <SearchInput /> */}</div>
      )}
      <div className="ml-auto flex gap-x-2">
        {isTeacherPage || isCoursePage ? (
          <Link to="/">
            <Button size="sm" variant="ghost">
              <LogOut className="mr-2 size-4" />
              Exit
            </Button>
          </Link>
        ) : isTeacher ? (
          <Link to="/teacher/courses">
            <Button size="sm" variant="ghost">
              Teacher mode
            </Button>
          </Link>
        ) : null}
        <UserButton />
      </div>
    </>
  )
}
