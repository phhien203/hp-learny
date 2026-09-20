import { getAuth } from '@clerk/react-router/server'
import { ActionFunctionArgs, data } from 'react-router';
import { jsonWithSuccess } from 'remix-toast'
import { db } from '~/lib/db.server'

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return data({ error: 'Unauthorized' }, { status: 401 })
  }

  const { courseId, attachmentId } = args.params

  if (!courseId) {
    return data({ error: 'Course id is required' }, { status: 400 })
  }

  if (!attachmentId) {
    return data({ error: 'Attachment id is required' }, { status: 400 })
  }

  const courseOwner = await db.course.findUnique({
    where: {
      id: courseId,
      userId,
    },
  })

  if (!courseOwner) {
    return data({ error: 'Unauthorized' }, { status: 401 })
  }

  const attachment = await db.attachment.delete({
    where: {
      id: attachmentId,
      courseId,
    },
  })

  return jsonWithSuccess(
    { ok: true, attachment },
    { message: 'Attachment deleted successfully' },
    { status: 200 },
  )
}
