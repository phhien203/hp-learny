import { and, eq } from 'drizzle-orm'
import { courses,  } from '~/lib/schema'
import { getAuth } from '@clerk/react-router/server'
import { ActionFunctionArgs } from 'react-router'
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

    const ownCourse = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId ?? ''), eq(courses.userId, userId)),
      with: { chapters: true },
    })

    if (!ownCourse) {
      return jsonWithError(
        { error: 'Unauthorized' },
        { message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const hasPublishedChapter = ownCourse.chapters.some(
      (chapter: { isPublished: boolean }) => chapter.isPublished,
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

    const publishedCourse = (
      await db
        .update(courses)
        .set({
          isPublished: true,
        })
        .where(and(eq(courses.id, courseId ?? ''), eq(courses.userId, userId)))
        .returning()
    )[0]

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
