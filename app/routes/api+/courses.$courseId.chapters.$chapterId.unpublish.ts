import { getAuth } from '@clerk/remix/ssr.server'
import { db } from '~/lib/db.server'
import { ActionFunctionArgs, json } from 'react-router';
import { jsonWithError, jsonWithSuccess } from 'remix-toast'

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

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId: userId,
      },
    })

    if (!courseOwner) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const unPublishedChapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        isPublished: false,
      },
    })

    const publishedChapters = await db.chapter.findMany({
      where: {
        courseId: courseId,
        isPublished: true,
      },
    })

    if (!publishedChapters.length) {
      await db.course.update({
        where: {
          id: courseId,
          userId: userId,
        },
        data: {
          isPublished: false,
        },
      })
    }

    return jsonWithSuccess(
      { chapter: unPublishedChapter },
      { message: 'Chapter unpublished' },
      { status: 200 },
    )
  } catch (error) {
    console.log('[COURSE_ID_CHAPTER_ID_UNPUBLISH]', error)
    return jsonWithError(
      { error: 'Internal Error' },
      { message: 'Something went wrong' },
      { status: 500 },
    )
  }
}
