import type { Course, Purchase } from './schema'
import { db } from './db.server'

type PurchaseWithCourse = Purchase & {
  course: Course
}

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {}

  purchases.forEach((purchase) => {
    const courseTitle = purchase.course.title

    if (!grouped[courseTitle]) {
      grouped[courseTitle] = 0
    }

    grouped[courseTitle] += purchase.course.price ?? 0
  })

  return grouped
}

export async function getAnalytics(userId: string) {
  try {
    const purchases = await db.purchase.findMany({
      where: {
        course: {
          userId,
        },
      },
      include: {
        course: true,
      },
    })
    const groupedEarnings = groupByCourse(purchases)

    const data = Object.entries(groupedEarnings).map(
      ([courseTitle, totalRevenue]) => ({
        name: courseTitle,
        totalRevenue,
      }),
    )

    const totalRevenue = data.reduce((acc, curr) => acc + curr.totalRevenue, 0)
    const totalSales = purchases.length

    return {
      data,
      totalRevenue,
      totalSales,
    }
  } catch (error) {
    console.log('[GET_ANALYTICS]', error)

    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    }
  }
}
