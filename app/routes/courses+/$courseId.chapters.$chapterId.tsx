import { getAuth } from '@clerk/remix/ssr.server'
import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { FileIcon } from 'lucide-react'
import { Banner } from '~/components/Banner'
import { Separator } from '~/components/ui/separator'
import { getChapter } from '~/lib/get-chapter.server'
import { CourseEnrollButton } from './_components/CourseEnrollButton'
import { VideoPlayer } from './_components/VideoPlayer'

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

        <div>
          <div className="flex flex-col items-center justify-between p-4 md:flex-row">
            <h2 className="text-2xl font-semibold">{chapter.title}</h2>

            {purchase ? (
              <div>TODO course progress button</div>
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
