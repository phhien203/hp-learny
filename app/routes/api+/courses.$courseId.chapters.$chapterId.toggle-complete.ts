import { getAuth } from '@clerk/remix/ssr.server'
import { db } from '~/lib/db.server'
import { ActionFunctionArgs, json } from '@remix-run/node'
import {
  jsonWithError,
  jsonWithSuccess,
  redirectWithSuccess,
} from 'remix-toast'

export async function action(args: ActionFunctionArgs) {
  try {
    const { userId } = await getAuth(args)

    if (!userId) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId, chapterId } = args.params

    if (!courseId || !chapterId) {
      return json(
        { error: 'Course ID and chapter ID are required' },
        { status: 400 },
      )
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
    })

    if (!course) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    })

    if (!chapter) {
      return json({ error: 'Chapter not found' }, { status: 404 })
    }

    const formData = await args.request.formData()
    const isCompleted = formData.get('isCompleted') === 'true'
    const nextChapterId = formData.get('nextChapterId')

    await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId: userId,
          chapterId: chapterId,
        },
      },
      update: {
        isCompleted: isCompleted,
      },
      create: {
        userId: userId,
        chapterId: chapterId,
        isCompleted: isCompleted,
      },
    })

    if (isCompleted && nextChapterId) {
      return redirectWithSuccess(
        `/courses/${courseId}/chapters/${nextChapterId}`,
        {
          message: 'Progress updated',
        },
        { status: 200 },
      )
    } else {
      return jsonWithSuccess(
        { completed: isCompleted },
        { message: 'Progress updated' },
        { status: 200 },
      )
    }
  } catch (error) {
    console.log('[COURSE_ID_CHAPTER_ID_TOGGLE_PROGRESS]', error)
    return jsonWithError(
      { error: 'Internal Error' },
      { message: 'Something went wrong' },
      { status: 500 },
    )
  }
}
