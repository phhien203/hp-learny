import type { Chapter, Course, UserProgress } from '~/lib/schema'
import { MenuIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import { CourseSidebar } from './CourseSidebar'

export function CourseMobileSidebar({
  course,
  progressCount,
}: {
  course: Course & {
    chapters: (Chapter & { userProgress: UserProgress[] | null })[]
  }
  progressCount: number
}) {
  return (
    <Sheet>
      <SheetTrigger className="pr-4 transition hover:opacity-75 md:hidden">
        <MenuIcon className="size-6" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72 bg-white p-0">
        <CourseSidebar
          course={course}
          progressCount={progressCount}
          purchase={null}
        />
      </SheetContent>
    </Sheet>
  )
}
