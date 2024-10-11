import { getAuth } from '@clerk/remix/ssr.server'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect
} from '@remix-run/node'
import { Link, useLoaderData, useParams } from '@remix-run/react'
import crypto from 'crypto'
import {
  ArrowLeftIcon,
  EyeIcon,
  LayoutDashboard,
  VideoIcon,
} from 'lucide-react'
import {
  jsonWithError,
  jsonWithSuccess,
  redirectWithSuccess,
} from 'remix-toast'
import { Banner } from '~/components/Banner'
import { BunnyChapterVideoForm } from '~/components/BunnyChapterVideoForm'
import {
  ChapterAccessForm,
  chapterAccessFormSchema,
} from '~/components/ChapterAccessForm'
import { ChapterActions } from '~/components/ChapterActions'
import {
  ChapterDescriptionForm,
  chapterDescriptionFormSchema,
} from '~/components/ChapterDescriptionForm'
import { ChapterTitleForm } from '~/components/ChapterTitleForm'
import { chapterVideoFormSchema } from '~/components/ChapterVideoForm'
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
  })

  if (!chapter) {
    return redirect('/')
  }

  const unsignedVideoUrl = chapter.videoUrl
  let signedVideoUrl = ''

  if (unsignedVideoUrl) {
    const parsedUrl = new URL(unsignedVideoUrl)

    const pathSegments = parsedUrl.pathname.split('/') // Example: ['', 'embed', '228530', 'cbf30637-b0de-4f8f-9e43-2199a5c5e967']
    const videoId = pathSegments[3]
    const expires = Math.floor(new Date().valueOf() / 1000) + 60 * 60 // 1 hour
    const data = `${process.env.BUNNY_TOKEN}${videoId}${expires}`
    const hash = crypto.createHash('sha256')
    const token = hash.update(data).digest('hex')

    parsedUrl.searchParams.set('token', token)
    parsedUrl.searchParams.set('expires', expires.toString())
    signedVideoUrl = parsedUrl.toString()
  }

  return json({ chapter, signedVideoUrl })
}

export default function ChapterPage() {
  const { chapter, signedVideoUrl } = useLoaderData<typeof loader>()
  const { courseId } = useParams<{ courseId: string }>()

  const requiredFields = [chapter.title, chapter.description, chapter.videoUrl]

  const totalFields = requiredFields.length
  const completedFields = requiredFields.filter(Boolean).length

  const completionText = `(${completedFields}/${totalFields})`

  const isComplete = requiredFields.every(Boolean)

  return (
    <>
      {!chapter.isPublished ? (
        <Banner
          label="This chapter is unpublished. It will not be visible to students until it is published."
          variant="warning"
        />
      ) : (
        <div className="h-[54px]" />
      )}
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

              <ChapterActions
                disabled={!isComplete}
                courseId={courseId!}
                chapterId={chapter.id}
                isPublished={chapter.isPublished}
              />
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
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={EyeIcon} size="sm" />
                <h2 className="text-xl">Access Settings</h2>
              </div>
              <ChapterAccessForm initialData={chapter.isFree} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={VideoIcon} size="sm" />
              <h2 className="text-xl">Add a video</h2>
            </div>

            <BunnyChapterVideoForm
              chapterId={chapter.id}
              videoUrl={signedVideoUrl}
            />
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

  const { courseId, chapterId } = args.params

  if (!courseId || !chapterId) {
    return jsonWithError(
      { error: 'Missing course or chapter id' },
      { message: 'Missing course or chapter id' },
      { status: 400 },
    )
  }

  const ownCourse = await db.course.findUnique({
    where: {
      id: courseId,
      userId,
    },
  })

  if (!ownCourse) {
    return jsonWithError(
      { error: 'Unauthorized' },
      { message: 'Unauthorized' },
      { status: 401 },
    )
  }

  if (args.request.method === 'DELETE') {
    return deleteChapter(args, userId)
  }

  if (args.request.method === 'POST') {
    return updateChapter(args)
  }

  return jsonWithError(
    { error: 'Method not allowed' },
    { message: 'Method not allowed' },
    { status: 405 },
  )
}

async function deleteChapter(args: ActionFunctionArgs, userId: string) {
  const { courseId, chapterId } = args.params

  const chapter = await db.chapter.findUnique({
    where: {
      id: chapterId,
      courseId,
    },
  })

  if (!chapter) {
    return jsonWithError(
      { error: 'Chapter not found' },
      { message: 'Chapter not found' },
      { status: 404 },
    )
  }

  await db.chapter.delete({
    where: {
      id: chapterId,
      courseId,
    },
  })

  const publishedChaptersInCourse = await db.chapter.findMany({
    where: {
      courseId,
      isPublished: true,
    },
  })

  if (publishedChaptersInCourse.length === 0) {
    await db.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: {
        isPublished: false,
      },
    })
  }

  return redirectWithSuccess(`/teacher/courses/${args.params.courseId}`, {
    message: 'Chapter deleted successfully',
  })
}

async function updateChapter(args: ActionFunctionArgs) {
  const formData = await args.request.formData()

  let submission

  if (formData.get('intent') === 'updateChapterTitle') {
    submission = parseWithZod(formData, { schema: titleFormSchema })
  } else if (formData.get('intent') === 'updateChapterDescription') {
    submission = parseWithZod(formData, {
      schema: chapterDescriptionFormSchema,
    })
  } else if (formData.get('intent') === 'updateChapterAccess') {
    submission = parseWithZod(formData, {
      schema: chapterAccessFormSchema,
    })
  } else if (formData.get('intent') === 'updateChapterVideoUrl') {
    submission = parseWithZod(formData, {
      schema: chapterVideoFormSchema,
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
