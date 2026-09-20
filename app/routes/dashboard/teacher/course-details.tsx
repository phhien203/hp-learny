import { and, asc, desc, eq } from 'drizzle-orm'
import {
  courses,
  attachments,
  chapters,
  categories as categoriesTable,
} from '~/lib/schema'
import { getAuth } from '@clerk/react-router/server'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  data,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from 'react-router'
import {
  CircleDollarSignIcon,
  FileIcon,
  LayoutDashboard,
  ListChecksIcon,
} from 'lucide-react'
import {
  jsonWithError,
  jsonWithSuccess,
  redirectWithSuccess,
} from 'remix-toast'
import { Banner } from '~/components/Banner'
import { IconBadge } from '~/components/IconBadge'
import { db } from '~/lib/db.server'
import { isTeacher } from '~/lib/user-role.server'
import { AttachmentForm } from './components/AttachmentForm'
import { CategoryForm, categoryFormSchema } from './components/CategoryForm'
import { ChaptersForm } from './components/ChaptersForm'
import { CourseAction } from './components/CourseActions'
import {
  DescriptionForm,
  descriptionFormSchema,
} from './components/DescriptionForm'
import { ImageForm, imageFormSchema } from './components/ImageForm'
import { PriceForm, priceFormSchema } from './components/PriceForm'
import { TitleForm, titleFormSchema } from './components/TitleForm'

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }

  const teacherRole = await isTeacher(args)

  if (!teacherRole) {
    return redirect('/search')
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, args.params.courseId ?? ''),
    with: {
      attachments: { orderBy: [desc(attachments.createdAt)] },
      chapters: { orderBy: [asc(chapters.position)] },
    },
  })

  if (!course) {
    return redirect('/teacher/courses')
  }

  const categories = await db.query.categories.findMany({
    orderBy: [asc(categoriesTable.name)],
  })

  return data({ course, categories })
}

export default function TeacherCoursePage() {
  const { course, categories } = useLoaderData<typeof loader>()

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.categoryId,
    course.chapters.some(
      (chapter: { isPublished: boolean }) => chapter.isPublished,
    ),
  ]

  const totalFields = requiredFields.length
  const completedFields = requiredFields.filter(Boolean).length

  const completionText = `(${completedFields}/${totalFields})`

  const isComplete = requiredFields.every(Boolean)

  return (
    <>
      {!course.isPublished ? (
        <Banner
          label="This course is unpublished. It will not be visible in the course list."
          variant="warning"
        />
      ) : null}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Course setup</h1>
            <span className="text-sm text-slate-700">
              Complete all fields {completionText}
            </span>
          </div>

          <CourseAction
            disabled={!isComplete}
            courseId={course.id}
            isPublished={course.isPublished}
          />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} size="sm" />
              <h2 className="text-xl">Customize your course</h2>
            </div>
            <TitleForm initialData={course.title} />
            <DescriptionForm initialData={course.description} />
            <ImageForm initialData={course} />
            <CategoryForm
              initialData={course.categoryId}
              options={categories.map(
                (category: { id: string; name: string }) => ({
                  value: category.id,
                  label: category.name,
                }),
              )}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecksIcon} size="sm" />
                <h2 className="text-xl">Course chapters</h2>
              </div>
              <ChaptersForm initialData={course} courseId={course.id} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSignIcon} size="sm" />
                <h2 className="text-xl">Sell your course</h2>
              </div>
              <PriceForm initialData={course.price} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={FileIcon} size="sm" />
                <h2 className="text-xl">Attachments</h2>
              </div>
              <AttachmentForm initialData={course} courseId={course.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }

  const { courseId } = args.params

  if (!courseId) {
    return jsonWithError(
      { error: 'Course ID is required' },
      { message: 'Course ID is required' },
      { status: 400 },
    )
  }

  const ownCourse = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId ?? ''), eq(courses.userId, userId)),
  })

  if (!ownCourse) {
    return jsonWithError(
      { error: 'Unauthorized' },
      { message: 'Unauthorized' },
      { status: 401 },
    )
  }

  if (args.request.method === 'DELETE') {
    await (
      await db
        .delete(courses)
        .where(and(eq(courses.id, courseId ?? ''), eq(courses.userId, userId)))
        .returning()
    )[0]

    return redirectWithSuccess('/teacher/courses', {
      message: 'Course deleted successfully! 🎉',
    })
  }

  if (args.request.method === 'POST') {
    const formData = await args.request.formData()

    let submission

    if (formData.get('intent') === 'updateTitle') {
      submission = parseWithZod(formData, { schema: titleFormSchema })
    } else if (formData.get('intent') === 'updateDescription') {
      submission = parseWithZod(formData, { schema: descriptionFormSchema })
    } else if (formData.get('intent') === 'updateImage') {
      submission = parseWithZod(formData, { schema: imageFormSchema })
    } else if (formData.get('intent') === 'updateCategory') {
      submission = parseWithZod(formData, { schema: categoryFormSchema })
    } else if (formData.get('intent') === 'updatePrice') {
      submission = parseWithZod(formData, { schema: priceFormSchema })
    }

    if (submission?.status === 'success') {
      await (
        await db
          .update(courses)
          .set(submission.value)
          .where(
            and(
              eq(courses.id, args.params.courseId ?? ''),
              eq(courses.userId, userId),
            ),
          )
          .returning()
      )[0]

      return jsonWithSuccess(
        { ok: true },
        { message: 'Course updated successfully! 🎉' },
      )
    }

    return jsonWithError(
      { ok: false },
      { message: 'Oops! Something went wrong. Please try again later.' },
    )
  }

  return jsonWithError(
    { ok: false },
    { message: 'Invalid request method' },
    { status: 405 },
  )
}
