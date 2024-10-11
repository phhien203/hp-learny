import { Category, Course } from '@prisma/client'
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
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        title: {
          contains: title,
        },
        categoryId,
      },
      include: {
        category: true,
        chapters: {
          where: { isPublished: true },
          select: { id: true },
        },
        purchases: {
          where: { userId },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const courseWithProgress: CourseWithProgressWithCategory[] =
      await Promise.all(
        courses.map(async (course) => {
          if (course.purchases.length === 0) {
            return { ...course, progress: null }
          }

          const progressPercentage = await getProgress(userId, course.id)

          return { ...course, progress: progressPercentage }
        }),
      )

    return courseWithProgress
  } catch (error) {
    console.log('[GET_COURSES]', error)
    return []
  }
}
