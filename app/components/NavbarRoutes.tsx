import { UserButton } from '@clerk/remix'
import { LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { SearchInput } from './SearchInput'
import { Button } from './ui/button'

export function NavbarRoutes() {
  const location = useLocation()

  const isTeacherPage = location.pathname.startsWith('/teacher')
  const isPlayerPage = location.pathname.includes('/chapter')
  const isSearchPage = location.pathname.includes('/search')

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
      <div className="ml-auto flex gap-x-2">
        {isTeacherPage || isPlayerPage ? (
          <Link to="/">
            <Button size="sm" variant="ghost">
              <LogOut className="mr-2 size-4" />
              Exit
            </Button>
          </Link>
        ) : (
          <Link to="/teacher/courses">
            <Button size="sm" variant="ghost">
              Teacher mode
            </Button>
          </Link>
        )}
        <UserButton />
      </div>
    </>
  )
}
