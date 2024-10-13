import { getAuth } from '@clerk/remix/ssr.server'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, json } from '@remix-run/node'
import { jsonWithError, jsonWithSuccess } from 'remix-toast'
import { chaptersFormSchema } from '~/routes/_dashboard+/teacher+/_components/ChaptersForm'
import { db } from '~/lib/db.server'

export async function action(args: ActionFunctionArgs) {
  try {
    const { userId } = await getAuth(args)

    if (!userId) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = args.params

    if (!courseId) {
      return json({ error: 'Course ID is required' }, { status: 400 })
    }

    const formData = await args.request.formData()
    const submission = parseWithZod(formData, { schema: chaptersFormSchema })

    if (submission.status !== 'success') {
      return json({ error: 'Failed to update course' }, { status: 400 })
    }

    const { title } = submission.value

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    })

    if (!courseOwner) {
      return json({ error: 'Unauthorized' }, { status: 401 })
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

    return jsonWithSuccess(
      { chapter },
      { message: 'Chapter created successfully' },
      { status: 201 },
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
