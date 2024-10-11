import { getAuth } from '@clerk/remix/ssr.server'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
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
import { AttachmentForm } from '~/components/AttachmentForm'
import { Banner } from '~/components/Banner'
import { CategoryForm, categoryFormSchema } from '~/components/CategoryForm'
import { ChaptersForm } from '~/components/ChaptersForm'
import { CourseAction } from '~/components/CourseActions'
import {
  DescriptionForm,
  descriptionFormSchema,
} from '~/components/DescriptionForm'
import { IconBadge } from '~/components/IconBadge'
import { ImageForm, imageFormSchema } from '~/components/ImageForm'
import { PriceForm, priceFormSchema } from '~/components/PriceForm'
import { TitleForm, titleFormSchema } from '~/components/TitleForm'
import { db } from '~/lib/db.server'

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }

  const course = await db.course.findUnique({
    where: {
      id: args.params.courseId,
    },
    include: {
      attachments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      chapters: {
        orderBy: {
          position: 'asc',
        },
      },
    },
  })

  if (!course) {
    return redirect('/teacher/courses')
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return json({ course, categories })
}

export default function TeacherCoursePage() {
  const { course, categories } = useLoaderData<typeof loader>()

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId,
    course.chapters.some((chapter) => chapter.isPublished),
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
      ) : (
        <div className="h-[54px]" />
      )}
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
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
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

  const ownCourse = await db.course.findUnique({
    where: { id: courseId, userId },
  })

  if (!ownCourse) {
    return jsonWithError(
      { error: 'Unauthorized' },
      { message: 'Unauthorized' },
      { status: 401 },
    )
  }

  if (args.request.method === 'DELETE') {
    await db.course.delete({
      where: { id: courseId, userId },
    })

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
      await db.course.update({
        where: {
          id: args.params.courseId,
          userId,
        },
        data: submission.value,
      })

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
