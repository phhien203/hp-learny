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
  LayoutDashboard,
  ListChecksIcon,
} from 'lucide-react'
import { jsonWithError, jsonWithSuccess } from 'remix-toast'
import { CategoryForm, categoryFormSchema } from '~/components/CategoryForm'
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
  ]

  const totalFields = requiredFields.length
  const completedFields = requiredFields.filter(Boolean).length

  const completionText = `(${completedFields}/${totalFields})`

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Course setup</h1>

          <span className="text-sm text-slate-700">
            Complete all fields {completionText}
          </span>
        </div>
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

            <div>TODO: chapters</div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={CircleDollarSignIcon} size="sm" />
              <h2 className="text-xl">Sell your course</h2>
            </div>

            <PriceForm initialData={course.price} />
          </div>
        </div>
      </div>
    </div>
  )
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }

  // TODO: check if the user is the owner of the course

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

    return jsonWithSuccess({ ok: true }, 'Course updated successfully! 🎉')
  }

  return jsonWithError(
    { ok: false },
    'Oops! Something went wrong. Please try again later.',
  )
}
