import { and, eq } from 'drizzle-orm'
import { courses, chapters } from '~/lib/schema'
import { getAuth } from '@clerk/react-router/server'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  data,
  LoaderFunctionArgs,
  redirect,
  Link,
  useLoaderData,
  useParams,
} from 'react-router'
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
import { ClientOnly } from '~/components/ClientOnly'
import { Banner } from '~/components/Banner'
import { IconBadge } from '~/components/IconBadge'
import {
  deleteBunnyVideo,
  getBunnyVideoStatus,
  signVideoUrl,
} from '~/lib/bunny.server'
import { db } from '~/lib/db.server'
import { isTeacher } from '~/lib/user-role.server'
import { BunnyChapterVideoForm } from './components/BunnyChapterVideoForm.client'
import {
  ChapterAccessForm,
  chapterAccessFormSchema,
} from './components/ChapterAccessForm'
import { ChapterActions } from './components/ChapterActions'
import {
  ChapterDescriptionForm,
  chapterDescriptionFormSchema,
} from './components/ChapterDescriptionForm'
import { ChapterTitleForm } from './components/ChapterTitleForm'
import { chapterVideoFormSchema } from './components/ChapterVideoForm'
import { titleFormSchema } from './components/TitleForm'

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

  const ownCourse = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId ?? ''), eq(courses.userId, userId)),
  })

  if (!ownCourse) {
    return redirect('/')
  }

  const chapter = await db.query.chapters.findFirst({
    where: and(
      eq(chapters.id, chapterId ?? ''),
      eq(chapters.courseId, ownCourse.id ?? ''),
    ),
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

  return data({ chapter, signedVideoUrl, videoStatus, encodeProgress })
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

  const chapter = await db.query.chapters.findFirst({
    where: and(
      eq(chapters.id, chapterId ?? ''),
      eq(chapters.courseId, courseId ?? ''),
    ),
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

  await (
    await db
      .delete(chapters)
      .where(
        and(
          eq(chapters.id, chapterId ?? ''),
          eq(chapters.courseId, courseId ?? ''),
        ),
      )
      .returning()
  )[0]

  const publishedChaptersInCourse = await db.query.chapters.findMany({
    where: and(
      eq(chapters.courseId, courseId ?? ''),
      eq(chapters.isPublished, true),
    ),
  })

  if (publishedChaptersInCourse.length === 0) {
    await (
      await db
        .update(courses)
        .set({
          isPublished: false,
        })
        .where(and(eq(courses.id, courseId ?? ''), eq(courses.userId, userId)))
        .returning()
    )[0]
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
      const chapter = await db.query.chapters.findFirst({
        where: and(
          eq(chapters.id, args.params.chapterId ?? ''),
          eq(chapters.courseId, args.params.courseId ?? ''),
        ),
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

    await (
      await db
        .update(chapters)
        .set(submission.value)
        .where(
          and(
            eq(chapters.id, args.params.chapterId ?? ''),
            eq(chapters.courseId, args.params.courseId ?? ''),
          ),
        )
        .returning()
    )[0]

    return jsonWithSuccess({ ok: true }, 'Chapter updated successfully! 🎉')
  }

  return jsonWithError(
    { ok: false },
    'Oops! Something went wrong. Please try again later.',
  )
}
