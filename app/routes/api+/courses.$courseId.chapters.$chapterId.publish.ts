import { getAuth } from '@clerk/react-router/server'
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

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    })

    if (
      !chapter ||
      !chapter.title ||
      !chapter.description ||
      !chapter.videoUrl
    ) {
      return jsonWithError(
        { error: 'Missing required fields' },
        { message: 'Missing required fields' },
        { status: 400 },
      )
    }

    const publishedChapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        isPublished: true,
      },
    })

    return jsonWithSuccess(
      { chapter: publishedChapter },
      { message: 'Chapter published' },
      { status: 200 },
    )
  } catch (error) {
    console.log('[COURSE_ID_CHAPTER_ID_PUBLISH]', error)
    return jsonWithError(
      { error: 'Internal Error' },
      { message: 'Something went wrong' },
      { status: 500 },
    )
  }
}
