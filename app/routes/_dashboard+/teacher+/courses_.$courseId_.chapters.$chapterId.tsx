import { getAuth } from '@clerk/react-router/server'
import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from 'react-router';
import { Link, useLoaderData, useParams } from 'react-router';
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
import { ClientOnly } from 'remix-utils/client-only'
import { Banner } from '~/components/Banner'
import { IconBadge } from '~/components/IconBadge'
import {
  deleteBunnyVideo,
  getBunnyVideoStatus,
  signVideoUrl,
} from '~/lib/bunny.server'
import { db } from '~/lib/db.server'
import { isTeacher } from '~/lib/user-role.server'
import { BunnyChapterVideoForm } from './_components/BunnyChapterVideoForm.client'
import {
  ChapterAccessForm,
  chapterAccessFormSchema,
} from './_components/ChapterAccessForm'
import { ChapterActions } from './_components/ChapterActions'
import {
  ChapterDescriptionForm,
  chapterDescriptionFormSchema,
} from './_components/ChapterDescriptionForm'
import { ChapterTitleForm } from './_components/ChapterTitleForm'
import { chapterVideoFormSchema } from './_components/ChapterVideoForm'
import { titleFormSchema } from './_components/TitleForm'

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/')
  }

  const teacherRole = await isTeacher(args)

  if (!teacherRole) {
    return redirect('/search')
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

  const videoId = chapter.videoUrl
  let signedVideoUrl = ''

  let videoStatus: number | null = null
  let encodeProgress = 0

  if (videoId) {
    signedVideoUrl = signVideoUrl(videoId)
    const status = await getBunnyVideoStatus(videoId)

    videoStatus = status?.[0] ?? null
    encodeProgress = status?.[1] || 0
  }

  return json({ chapter, signedVideoUrl, videoStatus, encodeProgress })
}

export default function ChapterPage() {
  const { chapter, signedVideoUrl, videoStatus, encodeProgress } =
    useLoaderData<typeof loader>()
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
      ) : null}
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

            <ClientOnly
              fallback={
                <div className="flex aspect-video h-[360px] w-full items-center justify-center">
                  <p className="text-sm text-slate-500">Loading...</p>
                </div>
              }
            >
              {() => (
                <BunnyChapterVideoForm
                  videoUrl={signedVideoUrl}
                  videoStatus={videoStatus}
                  encodeProgress={encodeProgress}
                />
              )}
            </ClientOnly>
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

  if (chapter.videoUrl) {
    await deleteBunnyVideo(chapter.videoUrl)
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
    if ((submission.value as { videoUrl: string }).videoUrl) {
      const chapter = await db.chapter.findUnique({
        where: {
          id: args.params.chapterId,
          courseId: args.params.courseId,
        },
      })

      if (!chapter) {
        return jsonWithError(
          { error: 'Chapter not found' },
          { message: 'Chapter not found' },
          { status: 404 },
        )
      }

      if (chapter.videoUrl) {
        await deleteBunnyVideo(chapter.videoUrl)
      }
    }

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
