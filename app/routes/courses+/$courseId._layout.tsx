import { getAuth } from '@clerk/react-router/server'
import { Chapter, Course, Purchase, UserProgress } from '@prisma/client'
import { data, LoaderFunctionArgs, redirect } from 'react-router';
import { Outlet, useLoaderData } from 'react-router';
import { db } from '~/lib/db.server'
import { getProgress } from '~/lib/get-progress.server'
import CourseNavbar from './_components/CourseNavbar'
import { CourseSidebar } from './_components/CourseSidebar'

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
    where: {
      id: courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              userId,
            },
          },
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

  const progressCount = await getProgress(userId, course.id)

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  })

  return data({ course, progressCount, purchase })
}

export default function CourseDetailsLayout() {
  const { course, progressCount, purchase } = useLoaderData<typeof loader>()

  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-50 h-[69px] w-full md:pl-80">
        <CourseNavbar
          course={
            course as unknown as Course & { chapters: (Chapter & null)[] }
          }
          progressCount={progressCount}
        />
      </div>

      <div className="fixed inset-y-0 z-50 hidden h-full w-80 flex-col md:flex">
        <CourseSidebar
          course={
            course as unknown as Course & {
              chapters: (Chapter & { userProgress: UserProgress[] | null })[]
            }
          }
          progressCount={progressCount}
          purchase={purchase as Purchase | null}
        />
      </div>
      <main className="h-full pt-[69px] md:pl-80">
        <Outlet />
      </main>
    </div>
  )
}
