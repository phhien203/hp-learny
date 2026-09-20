import { and, desc, eq, like } from 'drizzle-orm'
import { chapters, courses as coursesTable, purchases } from '~/lib/schema'
import type { Category, Course } from './schema'
import { db } from './db.server'
import { getProgress } from './get-progress.server'

type CourseWithProgressWithCategory = Course & {
  category: Category | null
  chapters: { id: string }[]
  progress: number | null
}

type GetCoursesArgs = {
  userId: string
  title?: string
  categoryId?: string
}

export async function getCourses({
  userId,
  title,
  categoryId,
}: GetCoursesArgs): Promise<CourseWithProgressWithCategory[]> {
  try {
    const courses = await db.query.courses.findMany({
      where: and(
        eq(coursesTable.isPublished, true),
        title
          ? like(
              coursesTable.title,
              '%' + title.replace(/[\\%_]/g, '\\$&') + '%',
            )
          : undefined,
        categoryId ? eq(coursesTable.categoryId, categoryId) : undefined,
      ),
      orderBy: [desc(coursesTable.createdAt)],
      with: {
        category: true,
        chapters: {
          where: eq(chapters.isPublished, true),
          columns: { id: true },
        },
        purchases: { where: eq(purchases.userId, userId) },
      },
    })

    const courseWithProgress: CourseWithProgressWithCategory[] =
      await Promise.all(
        courses.map(
          async (
            course: Course & {
              category: Category | null
              chapters: { id: string }[]
              purchases: { id: string }[]
            },
          ) => {
            if (course.purchases.length === 0) {
              return { ...course, progress: null }
            }

            const progressPercentage = await getProgress(userId, course.id)

            return { ...course, progress: progressPercentage }
          },
        ),
      )

    return courseWithProgress
  } catch (error) {
    console.log('[GET_COURSES]', error)
    return []
  }
}
