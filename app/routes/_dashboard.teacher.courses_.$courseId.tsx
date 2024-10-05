import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getAuth } from '@clerk/remix/ssr.server'
import { db } from '~/lib/db.server'
import { useLoaderData } from '@remix-run/react'

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }

  const course = await db.course.findUnique({
    where: {
      id: args.params.courseId,
    },
  })

  if (!course) {
    return redirect('/teacher/courses')
  }

  return json({ course })
}

export default function TeacherCoursePage() {
  const { course } = useLoaderData<typeof loader>()

  return <div>Course id: {course.id}</div>
}
