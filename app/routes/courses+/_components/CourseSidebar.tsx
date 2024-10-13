import { Chapter, Course, Purchase, UserProgress } from '@prisma/client'
import { CourseSidebarItem } from './CourseSidebarItem'

export function CourseSidebar({
  course,
  progressCount,
  purchase,
}: {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null
    })[]
  }
  progressCount: number
  purchase: Purchase | null
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r shadow-sm">
      <div className="flex h-[69px] flex-col border-b p-5">
        <h1 className="font-semibold">{course.title}</h1>
        {/* check purchase and add progress */}
      </div>

      <div className="flex w-full flex-col">
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  )
}
