import { getAuth } from '@clerk/remix/ssr.server'
import { ActionFunctionArgs } from 'react-router';
import { jsonWithError, jsonWithSuccess } from 'remix-toast'
import { db } from '~/lib/db.server'

export async function action(args: ActionFunctionArgs) {
  try {
    const { userId } = await getAuth(args)

    if (!userId) {
      return jsonWithError(
        { error: 'Unauthorized' },
        { message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const { courseId } = args.params

    if (!courseId) {
      return jsonWithError(
        { error: 'Course ID is required' },
        { message: 'Course ID is required' },
        { status: 400 },
      )
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId: userId,
      },
      include: {
        chapters: true,
      },
    })

    if (!ownCourse) {
      return jsonWithError(
        { error: 'Unauthorized' },
        { message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const hasPublishedChapter = ownCourse.chapters.some(
      (chapter) => chapter.isPublished,
    )

    if (
      !ownCourse.title ||
      !ownCourse.description ||
      !ownCourse.imageUrl ||
      !ownCourse.categoryId ||
      !hasPublishedChapter
    ) {
      return jsonWithError(
        { error: 'Missing required fields' },
        { message: 'Missing required fields' },
        { status: 400 },
      )
    }

    const publishedCourse = await db.course.update({
      where: { id: courseId, userId: userId },
      data: {
        isPublished: true,
      },
    })

    return jsonWithSuccess(
      { course: publishedCourse },
      { message: 'Course published' },
      { status: 200 },
    )
  } catch (error) {
    console.log('[COURSE_ID_PUBLISH]', error)
    return jsonWithError(
      { error: 'Internal Error' },
      { message: 'Something went wrong' },
      { status: 500 },
    )
  }
}
