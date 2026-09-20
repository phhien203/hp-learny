import { getAuth } from '@clerk/react-router/server'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, json } from 'react-router';
import { jsonWithSuccess } from 'remix-toast'
import { attachmentFormSchema } from '~/routes/_dashboard+/teacher+/_components/AttachmentForm'
import { db } from '~/lib/db.server'

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { courseId } = args.params

  if (!courseId) {
    return json({ error: 'Course id is required' }, { status: 400 })
  }

  const formData = await args.request.formData()
  const submission = parseWithZod(formData, { schema: attachmentFormSchema })

  if (submission?.status !== 'success') {
    return json({ error: 'Invalid attachment id' }, { status: 400 })
  }

  const { name, url } = submission.value

  const courseOwner = await db.course.findUnique({
    where: {
      id: courseId,
      userId,
    },
  })

  if (!courseOwner) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  const attachment = await db.attachment.create({
    data: {
      name,
      url,
      courseId,
    },
  })

  return jsonWithSuccess(
    { ok: true, attachment },
    { message: 'Attachment created successfully' },
    { status: 201 },
  )
}
