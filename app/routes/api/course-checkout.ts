import { and, eq } from 'drizzle-orm'
import { courses, purchases } from '~/lib/schema'
import { getAuth } from '@clerk/react-router/server'
import { ActionFunctionArgs, data } from 'react-router'
import { jsonWithError, jsonWithSuccess } from 'remix-toast'
import { getUserEmail } from '~/lib/clerk.server'
import { db } from '~/lib/db.server'
import { isWhitelistedUser } from '~/lib/user-role.server'

export async function action(args: ActionFunctionArgs) {
  try {
    const { userId } = await getAuth(args)

    if (!userId) {
      return data({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = args.params

    if (!courseId) {
      return data({ error: 'Course ID is required' }, { status: 400 })
    }

    const userEmail = await getUserEmail(userId)

    if (!userEmail || !isWhitelistedUser(userEmail)) {
      return data({ error: 'Unauthorized' }, { status: 401 })
    }

    const course = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId ?? ''), eq(courses.isPublished, true)),
    })

    if (!course) {
      return data({ error: 'Course not found' }, { status: 404 })
    }

    const purchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.userId, userId),
        eq(purchases.courseId, courseId ?? ''),
      ),
    })

    if (purchase) {
      return jsonWithError(
        { ok: false },
        { message: 'Purchase already exists' },
        { status: 400 },
      )
    }

    await (
      await db
        .insert(purchases)
        .values({
          userId,
          courseId,
        })
        .returning()
    )[0]

    return jsonWithSuccess({ ok: true }, { message: 'Enrolled in course 🎉' })
  } catch (error) {
    console.error('[COURSE_ID_CHECKOUT]', error)
    return data({ error: 'Internal Server Error' }, { status: 500 })
  }
}
