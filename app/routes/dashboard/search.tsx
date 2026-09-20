import { getAuth } from '@clerk/react-router/server'
import { data, LoaderFunctionArgs, redirect, useLoaderData } from 'react-router'
import { getUserEmail } from '~/lib/clerk.server'
import { db } from '~/lib/db.server'
import { getCourses } from '~/lib/get-courses.server'
import { isWhitelistedUser } from '~/lib/user-role.server'
import CoursesList, {
  CourseWithProgressWithCategory,
} from './components/CoursesList'

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/')
  }

  const userEmail = await getUserEmail(userId)

  if (!userEmail) {
    return redirect('/')
  }

  if (!isWhitelistedUser(userEmail)) {
    return data({
      categories: [],
      courses: [],
    })
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  const courses = await getCourses({ userId, ...args.params })

  return data({ categories, courses })
}

export default function SearchPage() {
  const { courses } = useLoaderData<typeof loader>()

  return (
    <>
      <div className="px-6 pt-6 md:mb-0 md:mt-6 md:hidden">
        {/* <SearchInput /> */}
      </div>
      <div className="p-6">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {/* <Categories items={categories as any[]} /> */}

        <CoursesList
          items={courses as unknown as CourseWithProgressWithCategory[]}
        />
      </div>
    </>
  )
}
