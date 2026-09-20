import { getAuth } from '@clerk/react-router/server'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, data } from 'react-router';
import { jsonWithError, redirectWithSuccess } from 'remix-toast'
import { chaptersFormSchema } from '~/routes/_dashboard+/teacher+/_components/ChaptersForm'
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

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    })

    if (!courseOwner) {
      return data({ error: 'Unauthorized' }, { status: 401 })
    }

    const lastChapter = await db.chapter.findFirst({
      where: {
        courseId: courseOwner.id,
      },
      orderBy: {
        position: 'desc',
      },
    })

    const position = lastChapter ? lastChapter.position + 1 : 1

    const chapter = await db.chapter.create({
      data: {
        title,
        courseId,
        position,
      },
    })

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
