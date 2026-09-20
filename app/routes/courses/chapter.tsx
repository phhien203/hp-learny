import { getAuth } from '@clerk/react-router/server'
import { ActionFunctionArgs, data, LoaderFunctionArgs, redirect, useLoaderData } from 'react-router'
import { FileIcon } from 'lucide-react'
import { jsonWithSuccess, redirectWithSuccess } from 'remix-toast'
import { Banner } from '~/components/Banner'
import { Separator } from '~/components/ui/separator'
import { getUserEmail } from '~/lib/clerk.server'
import { db } from '~/lib/db.server'
import { getChapter } from '~/lib/get-chapter.server'
import { isWhitelistedUser } from '~/lib/user-role.server'
import { CourseEnrollButton } from './components/CourseEnrollButton'
import { CourseProgressButton } from './components/CourseProgressButton'
import { VideoPlayer } from './components/VideoPlayer'

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/')
  }

  const userEmail = await getUserEmail(userId)

  if (!userEmail || !isWhitelistedUser(userEmail)) {
    return redirect('/')
  }

  const { courseId, chapterId } = args.params

  if (!courseId || !chapterId) {
    return redirect('/')
  }

  const {
    chapter,
    course,
    attachments,
    nextChapter,
    userProgress,
    purchase,
    signedVideoUrl,
  } = await getChapter({ userId, courseId, chapterId })

  if (!chapter || !course) {
    return redirect('/')
  }

  return data({
    chapter,
    course,
    attachments,
    nextChapter,
    userProgress,
    purchase,
    signedVideoUrl,
  })
}

export default function ChapterDetailsPage() {
  const {
    chapter,
    course,
    attachments,
    nextChapter,
    userProgress,
    purchase,
    signedVideoUrl,
  } = useLoaderData<typeof loader>()

  const isLocked = !chapter.isFree && !purchase
  const completeOnEnd = !!purchase && !userProgress?.isCompleted

  return (
    <div>
      {userProgress?.isCompleted && (
        <Banner label="You already completed this chapter" variant="success" />
      )}
      {isLocked && (
        <Banner
          label="You need to purchase this course to view this chapter"
          variant="warning"
        />
      )}

      <div className="mx-auto flex w-full flex-col pb-20">
        <div className="p-0">
          <VideoPlayer
            chapterId={chapter.id}
            title={chapter.title}
            courseId={course.id}
            nextChapterId={nextChapter?.id}
            videoUrl={signedVideoUrl}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
          />
        </div>

        <div>
          <div className="flex flex-col items-center justify-between p-4 md:flex-row">
            <h2 className="text-2xl font-semibold">{chapter.title}</h2>

            {purchase ? (
              <CourseProgressButton
                nextChapterId={nextChapter?.id ?? ''}
                isCompleted={!!userProgress?.isCompleted}
              />
            ) : (
              <CourseEnrollButton
                courseId={course.id}
                price={course.price ?? 0}
              />
            )}
          </div>

          <Separator className="" />

          <div className="p-4">
            <p className="text-sm text-slate-700">{chapter.description}</p>
          </div>

          {attachments.length ? (
            <>
              <Separator />

              <div className="p-4">
                {attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center rounded-md border bg-sky-200 p-3 text-sky-700 hover:underline"
                  >
                    <FileIcon className="mr-2 h-4 w-4" />
                    <p className="line-clamp-1">{attachment.name}</p>
                  </a>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return data({ error: 'Unauthorized' }, { status: 401 })
  }

  const { courseId, chapterId } = args.params

  if (!courseId || !chapterId) {
    return data(
      { error: 'Course ID and chapter ID are required' },
      { status: 400 },
    )
  }

  const formData = await args.request.formData()
  const action = formData.get('action')

  if (action === 'toggle-complete') {
    const isCompleted = formData.get('isCompleted') === 'true'
    const nextChapterId = formData.get('nextChapterId')

    await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      update: {
        isCompleted,
      },
      create: {
        userId,
        chapterId,
        isCompleted,
      },
    })

    if (isCompleted && nextChapterId) {
      return redirectWithSuccess(
        `/courses/${courseId}/chapters/${nextChapterId}`,
        { message: 'Progress updated' },
        { status: 302 },
      )
    }

    return jsonWithSuccess(
      { completed: isCompleted },
      { message: 'Progress updated' },
      { status: 200 },
    )
  }
}
