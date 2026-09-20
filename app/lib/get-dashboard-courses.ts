import { eq } from 'drizzle-orm'
import { chapters, purchases } from '~/lib/schema'
import type { Category, Course, Chapter } from './schema'
import { db } from './db.server'
import { getProgress } from './get-progress.server'

type CourseWithProgressWithCategory = Course & {
  category: Category | null
  chapters: Chapter[]
  progress: number | null
}

type DashboardCourses = {
  completedCourses: CourseWithProgressWithCategory[]
  inProgressCourses: CourseWithProgressWithCategory[]
}

export async function getDashboardCourses(
  userId: string,
): Promise<DashboardCourses> {
  try {
    const purchasedCourses = await db.query.purchases.findMany({
      where: eq(purchases.userId, userId),
      columns: {},
      with: {
        course: {
          with: {
            category: true,
            chapters: { where: eq(chapters.isPublished, true) },
          },
        },
      },
    })

    const courses: CourseWithProgressWithCategory[] = await Promise.all(
      purchasedCourses.map(async ({ course }) => ({
        ...course,
        progress: await getProgress(userId, course.id),
      })),
    )

    const completedCourses = courses.filter((course) => course.progress === 100)
    const inProgressCourses = courses.filter(
      (course) => (course.progress ?? 0) < 100,
    )

    return {
      completedCourses,
      inProgressCourses,
    }
  } catch (error) {
    console.log('[GET_DASHBOARD_COURSES]', error)
    return {
      completedCourses: [],
      inProgressCourses: [],
    }
  }
}
