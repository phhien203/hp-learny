import { asc, eq } from 'drizzle-orm'
import { courses, chapters } from '~/lib/schema'
import { getAuth } from '@clerk/react-router/server'
import { LoaderFunctionArgs, redirect } from 'react-router'
import { getUserEmail } from '~/lib/clerk.server'
import { db } from '~/lib/db.server'
import { isWhitelistedUser } from '~/lib/user-role.server'

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/')
  }

  const { courseId } = args.params

  if (!courseId) {
    return redirect('/')
  }

  const userEmail = await getUserEmail(userId)

  if (!userEmail || !isWhitelistedUser(userEmail)) {
    return redirect('/')
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId ?? ''),
    with: {
      chapters: {
        where: eq(chapters.isPublished, true),
        orderBy: [asc(chapters.position)],
      },
    },
  })

  if (!course) {
    return redirect('/')
  }

  return redirect(`/courses/${courseId}/chapters/${course.chapters[0].id}`)
}

export default function CourseDetailsPage() {
  return null
}
