import { getAuth } from '@clerk/react-router/server'
import { ActionFunctionArgs, json } from 'react-router';
import { jsonWithError, jsonWithSuccess } from 'remix-toast'
import { db } from '~/lib/db.server'

export async function action(args: ActionFunctionArgs) {
  try {
    const { userId } = await getAuth(args)

    if (!userId) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = args.params

    if (!courseId) {
      return json({ error: 'Course id is required' }, { status: 400 })
    }

    const formData = await args.request.formData()
    const list = formData.get('list')
    const listData = JSON.parse(list as string) as unknown as {
      id: string
      position: number
    }[]

    if (!listData || !Array.isArray(listData)) {
      return json({ error: 'List is required' }, { status: 400 })
    }

    const ownerCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    })

    if (!ownerCourse) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    for (const item of listData) {
      await db.chapter.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      })
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
