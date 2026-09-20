import type { Chapter, Course, UserProgress } from '~/lib/schema'
import { NavbarRoutes } from '~/components/NavbarRoutes'
import { CourseMobileSidebar } from './CourseMobileSidebar'

export default function CourseNavbar({
  course,
  progressCount,
}: {
  course: Course & {
    chapters: (Chapter & { userProgress: UserProgress[] | null })[]
  }
  progressCount: number
}) {
  return (
    <div className="flex items-center border-b bg-white p-4 shadow-sm">
      <CourseMobileSidebar course={course} progressCount={progressCount} />
      <NavbarRoutes isTeacher={false} />
    </div>
  )
}
