import { Category, Course } from '@prisma/client'
import CourseCard from './CourseCard'

export type CourseWithProgressWithCategory = Course & {
  category: Category | null
  chapters: { id: string }[]
  progress: number | null
}

interface CoursesListProps {
  items: CourseWithProgressWithCategory[]
}

export default function CoursesList({ items }: CoursesListProps) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        {items.map((item) => (
          <CourseCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl!}
            chaptersLength={item.chapters.length}
            price={item.price || 0}
            progress={item.progress}
            category={item?.category?.name ?? null}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="mt-10 text-center text-sm text-muted-foreground">
          No courses found
        </div>
      )}
    </div>
  )
}
