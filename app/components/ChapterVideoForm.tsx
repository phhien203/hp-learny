import MuxPlayer from '@mux/mux-player-react'
import { useFetcher } from '@remix-run/react'
import { PencilIcon, PlusCircleIcon, VideoIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'

export const chapterVideoFormSchema = z.object({
  videoUrl: z.string().min(1),
})

interface ChapterVideoFormProps {
  playbackId?: string | null
  videoUrl?: string | null
}

export function ChapterVideoForm({
  playbackId,
  videoUrl,
}: ChapterVideoFormProps) {
  const fetcher = useFetcher()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setIsEditing(false)
    }
  }, [fetcher.state, fetcher.data])

  console.log(fetcher)

  return (
    <div className="mt-6 rounded-md border bg-slate-100 p-4">
      <div className="flex items-center justify-between font-medium">
        Chapter video
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing((value) => !value)}
        >
          {isEditing && <>Cancel</>}

          {!isEditing && !videoUrl && (
            <>
              <PlusCircleIcon className="mr-2 size-4" />
              Add video
            </>
          )}

          {!isEditing && videoUrl && (
            <>
              <PencilIcon className="mr-2 size-4" />
              Edit
            </>
          )}
        </Button>
      </div>

      {!isEditing && !videoUrl ? (
        <div className="flex h-60 items-center justify-center rounded-md bg-slate-200">
          <VideoIcon className="size-10 text-slate-500" />
        </div>
      ) : null}

      {!isEditing && videoUrl && (
        <div className="relative mt-2 aspect-video">
          <MuxPlayer playbackId={playbackId || ''} />
        </div>
      )}

      {isEditing && (
        <div>
          {/* <FileUpload
            endpoint="chapterVideo"
            onChange={(args) => {
              if (args?.url) {
                fetcher.submit(
                  { videoUrl: args.url, intent: 'updateChapterVideoUrl' },
                  { method: 'post' },
                )
              }
            }}
          /> */}

          <fetcher.Form encType="multipart/form-data" method="post">
            <input name="video" type="file" />
            <Button type="submit">Upload Video</Button>
          </fetcher.Form>

          <div className="mt-4 text-xs text-muted-foreground">
            Upload your video file.
          </div>
        </div>
      )}

      {videoUrl && !isEditing && (
        <div className="mt-2 text-xs text-muted-foreground">
          Video can take a while to process. Refresh the page if video does not
          appear.
        </div>
      )}
    </div>
  )
}
