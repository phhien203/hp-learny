import { getAuth } from '@clerk/remix/ssr.server'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { LayoutDashboard } from 'lucide-react'
import { IconBadge } from '~/components/IconBadge'
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

  return json({ course })
}

export default function TeacherCoursePage() {
  const { course } = useLoaderData<typeof loader>()

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

  const formData = await args.request.formData()

  let submission

  if (formData.get('intent') === 'updateTitle') {
    submission = parseWithZod(formData, { schema: titleFormSchema })
  }

  if (submission?.status === 'success') {
    await db.course.update({
      where: {
        id: args.params.courseId,
      },
      data: submission.value,
    })
    return json({ ok: true } as const)
  }

  return json({ ok: false } as const)
}
