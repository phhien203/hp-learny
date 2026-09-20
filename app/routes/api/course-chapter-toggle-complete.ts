import { and, eq } from 'drizzle-orm'
import { courses, chapters, userProgress } from '~/lib/schema'
import { getAuth } from '@clerk/react-router/server'
import { db } from '~/lib/db.server'
import { ActionFunctionArgs, data } from 'react-router'
import {
  jsonWithError,
  jsonWithSuccess,
  redirectWithSuccess,
} from 'remix-toast'

export async function action(args: ActionFunctionArgs) {
  try {
    const { userId } = await getAuth(args)

    if (!userId) {
      return data({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId, chapterId } = args.params

    if (!courseId || !chapterId) {
      return data(
        { error: 'Course ID and chapter ID are required' },
        { status: 400 },
      )
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId ?? ''),
    })

    if (!course) {
      return data({ error: 'Unauthorized' }, { status: 401 })
    }

    const chapter = await db.query.chapters.findFirst({
      where: and(
        eq(chapters.id, chapterId ?? ''),
        eq(chapters.courseId, courseId ?? ''),
      ),
    })

    if (!chapter) {
      return data({ error: 'Chapter not found' }, { status: 404 })
    }

    const formData = await args.request.formData()
    const isCompleted = formData.get('isCompleted') === 'true'
    const nextChapterId = formData.get('nextChapterId')
    await (
      await db
        .insert(userProgress)
        .values({
          userId: userId,
          chapterId: chapterId,
          isCompleted: isCompleted,
        })
        .onConflictDoUpdate({
          target: [userProgress.userId, userProgress.chapterId],
          set: {
            ...{
              isCompleted: isCompleted,
            },
            updatedAt: new Date(),
          },
        })
        .returning()
    )[0]

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
