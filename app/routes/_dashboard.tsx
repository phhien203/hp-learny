import { json, LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { Navbar } from '~/components/Navbar'
import { Sidebar } from '~/components/Sidebar'
import { isTeacher } from '~/lib/user-role.server'

export async function loader(args: LoaderFunctionArgs) {
  const checkTeacher = await isTeacher(args)

  return json({ isTeacher: checkTeacher })
}

export default function DashboardLayout() {
  const { isTeacher } = useLoaderData<typeof loader>()

  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-50 h-[80px] w-full md:pl-56">
        <Navbar isTeacher={isTeacher} />
      </div>

      <div className="fixed inset-y-0 z-50 hidden h-full w-56 flex-col md:flex">
        <Sidebar />
      </div>

      <main className="h-full pt-[80px] md:pl-56">
        <Outlet />
      </main>
    </div>
  )
}
