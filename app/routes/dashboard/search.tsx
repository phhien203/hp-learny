import { asc } from 'drizzle-orm'
import { categories as categoriesTable } from '~/lib/schema'
import { getAuth } from '@clerk/react-router/server'
import { data, LoaderFunctionArgs, redirect, useLoaderData } from 'react-router'
import { getUserEmail } from '~/lib/clerk.server'
import { db } from '~/lib/db.server'
import { getCourses } from '~/lib/get-courses.server'
import { isWhitelistedUser } from '~/lib/user-role.server'
import CoursesList, {
  CourseWithProgressWithCategory,
} from './components/CoursesList'
import { SearchInput } from '~/components/SearchInput'
import { Categories } from '~/components/Categories'

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

  const categories = await db.query.categories.findMany({
    orderBy: [asc(categoriesTable.name)],
  })

  const searchParams = new URL(args.request.url).searchParams
  const courses = await getCourses({
    userId,
    title: searchParams.get('q') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
  })

  return data({ categories, courses })
}

export default function SearchPage() {
  const { categories, courses } = useLoaderData<typeof loader>()

  return (
    <>
      <div className="px-6 pt-6 md:mb-0 md:mt-6 md:hidden">
        <SearchInput />
      </div>
      <div className="p-6">
        <Categories items={categories} />

        <CoursesList
          items={courses as unknown as CourseWithProgressWithCategory[]}
        />
      </div>
    </>
  )
}
