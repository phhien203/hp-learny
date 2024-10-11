import { Course, Chapter, UserProgress } from '@prisma/client'
import { NavbarRoutes } from './NavbarRoutes'
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
      <NavbarRoutes />
    </div>
  )
}
