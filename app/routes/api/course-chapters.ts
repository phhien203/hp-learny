import { and, desc, eq } from 'drizzle-orm'
import { courses, chapters } from '~/lib/schema'
import { getAuth } from '@clerk/react-router/server'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, data } from 'react-router'
import { jsonWithError, redirectWithSuccess } from 'remix-toast'
import { chaptersFormSchema } from '~/routes/dashboard/teacher/components/ChaptersForm'
import { db } from '~/lib/db.server'

export async function action(args: ActionFunctionArgs) {
  try {
    const { userId } = await getAuth(args)

    if (!userId) {
      return data({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = args.params

    if (!courseId) {
      return data({ error: 'Course ID is required' }, { status: 400 })
    }

    const formData = await args.request.formData()
    const submission = parseWithZod(formData, { schema: chaptersFormSchema })

    if (submission.status !== 'success') {
      return data({ error: 'Failed to update course' }, { status: 400 })
    }

    const { title } = submission.value

    const courseOwner = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId ?? ''), eq(courses.userId, userId)),
    })

    if (!courseOwner) {
      return data({ error: 'Unauthorized' }, { status: 401 })
    }

    const lastChapter = await db.query.chapters.findFirst({
      where: eq(chapters.courseId, courseOwner.id ?? ''),
      orderBy: [desc(chapters.position)],
    })

    const position = lastChapter ? lastChapter.position + 1 : 1

    const chapter = (
      await db
        .insert(chapters)
        .values({
          title,
          courseId,
          position,
        })
        .returning()
    )[0]

    return redirectWithSuccess(
      `/teacher/courses/${courseId}/chapters/${chapter.id}`,
      { message: 'Chapter created successfully' },
      { status: 302 },
    )
  } catch (error) {
    console.log('[COURSES_CHAPTERS]', error)
    return jsonWithError(
      null,
      { message: 'Failed to create chapter' },
      { status: 500 },
    )
  }
}
