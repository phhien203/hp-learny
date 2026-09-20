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

    const unPublishedChapter = (
      await db
        .update(chapters)
        .set({
          isPublished: false,
        })
        .where(
          and(
            eq(chapters.id, chapterId ?? ''),
            eq(chapters.courseId, courseId ?? ''),
          ),
        )
        .returning()
    )[0]

    const publishedChapters = await db.query.chapters.findMany({
      where: and(
        eq(chapters.courseId, courseId ?? ''),
        eq(chapters.isPublished, true),
      ),
    })

    if (!publishedChapters.length) {
      await (
        await db
          .update(courses)
          .set({
            isPublished: false,
          })
          .where(
            and(eq(courses.id, courseId ?? ''), eq(courses.userId, userId)),
          )
          .returning()
      )[0]
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
