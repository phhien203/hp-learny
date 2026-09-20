import { and, eq } from 'drizzle-orm'
import { courses, chapters } from '~/lib/schema'
import { getAuth } from '@clerk/react-router/server'
import { db } from '~/lib/db.server'
import { ActionFunctionArgs, data } from 'react-router'
import { jsonWithError, jsonWithSuccess } from 'remix-toast'

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

    const courseOwner = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId ?? ''), eq(courses.userId, userId)),
    })

    if (!courseOwner) {
      return data({ error: 'Unauthorized' }, { status: 401 })
    }

    const chapter = await db.query.chapters.findFirst({
      where: and(
        eq(chapters.id, chapterId ?? ''),
        eq(chapters.courseId, courseId ?? ''),
      ),
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

    const publishedChapter = (
      await db
        .update(chapters)
        .set({
          isPublished: true,
        })
        .where(
          and(
            eq(chapters.id, chapterId ?? ''),
            eq(chapters.courseId, courseId ?? ''),
          ),
        )
        .returning()
    )[0]

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
