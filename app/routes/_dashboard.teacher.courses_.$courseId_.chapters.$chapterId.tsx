import { getAuth } from '@clerk/remix/ssr.server'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { Link, useLoaderData, useParams } from '@remix-run/react'
import { ArrowLeftIcon, LayoutDashboard } from 'lucide-react'
import { jsonWithError, jsonWithSuccess } from 'remix-toast'
import {
  ChapterDescriptionForm,
  chapterDescriptionFormSchema,
} from '~/components/ChapterDescriptionForm'
import { ChapterTitleForm } from '~/components/ChapterTitleForm'
import { IconBadge } from '~/components/IconBadge'
import { titleFormSchema } from '~/components/TitleForm'
import { db } from '~/lib/db.server'

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/')
  }

  const { courseId, chapterId } = args.params

  const ownCourse = await db.course.findUnique({
    where: {
      id: courseId,
      userId,
    },
  })

  if (!ownCourse) {
    return redirect('/')
  }

  const chapter = await db.chapter.findUnique({
    where: {
      id: chapterId,
      courseId: ownCourse.id,
    },
    include: {
      muxData: true,
    },
  })

  if (!chapter) {
    return redirect('/')
  }

  return json({ chapter })
}

export default function ChapterPage() {
  const { chapter } = useLoaderData<typeof loader>()
  const { courseId } = useParams()

  const requiredFields = [chapter.title, chapter.description, chapter.videoUrl]

  const totalFields = requiredFields.length
  const completedFields = requiredFields.filter(Boolean).length

  const completionText = `(${completedFields}/${totalFields})`

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <Link
            to={`/teacher/courses/${courseId}`}
            className="mb-6 flex items-center text-sm transition hover:opacity-75"
          >
            <ArrowLeftIcon className="mr-2 size-4" />
            Back to course setup
          </Link>

          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-y-2">
              <h1 className="text-2xl font-medium">Chapter Creation</h1>

              <span className="text-sm text-slate-700">
                Complete all fields {completionText}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} size="sm" />
              <h2 className="text-xl">Customize your chapter</h2>
            </div>

            <ChapterTitleForm initialData={chapter.title} />

            <ChapterDescriptionForm initialData={chapter.description} />
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

  const formData = await args.request.formData()

  let submission

  if (formData.get('intent') === 'updateChapterTitle') {
    submission = parseWithZod(formData, { schema: titleFormSchema })
  } else if (formData.get('intent') === 'updateChapterDescription') {
    submission = parseWithZod(formData, {
      schema: chapterDescriptionFormSchema,
    })
  }

  if (submission?.status === 'success') {
    await db.chapter.update({
      where: {
        id: args.params.chapterId,
        courseId: args.params.courseId,
      },
      data: submission.value,
    })

    return jsonWithSuccess({ ok: true }, 'Chapter updated successfully! 🎉')
  }

  return jsonWithError(
    { ok: false },
    'Oops! Something went wrong. Please try again later.',
  )
}
