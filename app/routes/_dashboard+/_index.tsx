import { getAuth } from '@clerk/remix/ssr.server'
import { redirect, type LoaderFunction, type LoaderFunctionArgs, type MetaFunction } from 'react-router';
// import { getDashboardCourses } from '~/lib/get-dashboard-courses'
import { useLoaderData } from 'react-router';
import { CheckCircleIcon, ClockIcon } from 'lucide-react'
import CoursesList from './_components/CoursesList'
import { InfoCard } from './_components/InfoCard'

export const meta: MetaFunction = () => {
  return [{ title: 'PET LMS' }, { name: 'description', content: 'PET LMS' }]
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/sign-in')
  }

  // const { completedCourses, inProgressCourses } =
  //   await getDashboardCourses(userId)

  // return json({ completedCourses, inProgressCourses })

  return redirect('/search')
}

export default function Dashboard() {
  const { completedCourses, inProgressCourses } = useLoaderData<typeof loader>()
  return (
    <div className="space-y-4 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard
          icon={ClockIcon}
          label="In Progress"
          numberOfItems={inProgressCourses.length}
          variant="default"
        />

        <InfoCard
          icon={CheckCircleIcon}
          label="Completed"
          numberOfItems={completedCourses.length}
          variant="success"
        />
      </div>

      <CoursesList items={[...inProgressCourses, ...completedCourses]} />
    </div>
  )
}
