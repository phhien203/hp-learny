import { getAuth } from '@clerk/remix/ssr.server'
import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { db } from '~/lib/db.server'
import { isTeacher } from '~/lib/user-role.server'
import { columns } from './_components/Columns'
import { DataTable } from './_components/DataTable'

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }

  const teacherRole = await isTeacher(args)

  if (!teacherRole) {
    return redirect('/search')
  }

  const courses = await db.course.findMany({
    where: { userId },
  })

  return json({ courses })
}

export default function TeacherCoursesPage() {
  const { courses } = useLoaderData<typeof loader>()

  return (
    <div className="p-6">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <DataTable columns={columns} data={courses as any[]} />
    </div>
  )
}
