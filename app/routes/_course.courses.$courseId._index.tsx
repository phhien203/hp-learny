import { getAuth } from '@clerk/remix/ssr.server'
import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { db } from '~/lib/db.server'

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/')
  }

  const { courseId } = args.params

  if (!courseId) {
    return redirect('/')
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: 'asc',
        },
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
