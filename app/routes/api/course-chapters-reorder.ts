import { and, eq } from 'drizzle-orm'
import { courses, chapters } from '~/lib/schema'
import { getAuth } from '@clerk/react-router/server'
import { ActionFunctionArgs, data } from 'react-router'
import { jsonWithError, jsonWithSuccess } from 'remix-toast'
import { db } from '~/lib/db.server'

export async function action(args: ActionFunctionArgs) {
  try {
    const { userId } = await getAuth(args)

    if (!userId) {
      return data({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = args.params

    if (!courseId) {
      return data({ error: 'Course id is required' }, { status: 400 })
    }

    const formData = await args.request.formData()
    const list = formData.get('list')
    const listData = JSON.parse(list as string) as unknown as {
      id: string
      position: number
    }[]

    if (!listData || !Array.isArray(listData)) {
      return data({ error: 'List is required' }, { status: 400 })
    }

    const ownerCourse = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId ?? ''), eq(courses.userId, userId)),
    })

    if (!ownerCourse) {
      return data({ error: 'Unauthorized' }, { status: 401 })
    }

    for (const item of listData) {
      await (
        await db
          .update(chapters)
          .set({
            position: item.position,
          })
          .where(eq(chapters.id, item.id ?? ''))
          .returning()
      )[0]
    }

    return jsonWithSuccess({ ok: true }, { message: 'Chapters reordered' })
  } catch (error) {
    console.log('COURSES REORDER ERROR', error)
    return jsonWithError(
      { ok: false },
      { message: 'Something went wrong' },
      { status: 500 },
    )
  }
}
