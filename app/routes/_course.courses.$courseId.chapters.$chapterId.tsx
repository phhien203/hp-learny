import { getAuth } from '@clerk/remix/ssr.server'
import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Banner } from '~/components/Banner'
import { VideoPlayer } from '~/components/VideoPlayer'
import { getChapter } from '~/lib/get-chapter.server'

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
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

  return json({
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
      </div>
    </div>
  )
}
