import { getAuth } from '@clerk/remix/ssr.server'
import { ActionFunctionArgs } from '@remix-run/node'
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

    const unPublishedCourse = await db.course.update({
      where: { id: courseId, userId: userId },
      data: {
        isPublished: false,
      },
    })

    return jsonWithSuccess(
      { course: unPublishedCourse },
      { message: 'Course un-published' },
      { status: 200 },
    )
  } catch (error) {
    console.log('[COURSE_ID_UNPUBLISH]', error)
    return jsonWithError(
      { error: 'Internal Error' },
      { message: 'Something went wrong' },
      { status: 500 },
    )
  }
}
