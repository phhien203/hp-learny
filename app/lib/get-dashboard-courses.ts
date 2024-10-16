import { Category, Course, Chapter } from '@prisma/client'
import { db } from './db.server'
import { getProgress } from './get-progress.server'

type CourseWithProgressWithCategory = Course & {
  category: Category
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
    const purchasedCourses = await db.purchase.findMany({
      where: {
        userId,
      },
      select: {
        course: {
          include: {
            category: true,
            chapters: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    })

    const courses = purchasedCourses.map(
      (purchase) => purchase.course,
    ) as CourseWithProgressWithCategory[]

    for (const course of courses) {
      const progress = await getProgress(userId, course.id)
      course['progress'] = progress
    }

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
