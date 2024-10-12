import { useFetcher } from '@remix-run/react'
import Uppy from '@uppy/core'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import { Dashboard as UppyDashboard } from '@uppy/react'
import Tus from '@uppy/tus'
import { PencilIcon, PlusCircleIcon, VideoIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ClientOnly } from 'remix-utils/client-only'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { action } from '~/routes/api.bunny.headers'

export const chapterVideoFormSchema = z.object({
  videoUrl: z.string().min(1),
})

interface ChapterVideoFormProps {
  chapterId: string
  videoUrl?: string | null
}

export function BunnyChapterVideoForm({
  chapterId,
  videoUrl,
}: ChapterVideoFormProps) {
  const fetcher = useFetcher()
  const requestVideoHeaders = useFetcher<typeof action>({
    key: 'requestVideoHeaders',
  })
  const [isEditing, setIsEditing] = useState(false)

  const handleEditClick = () => {
    setIsEditing((value) => {
      if (!requestVideoHeaders.data && !value) {
        requestVideoHeaders.submit(
          { title: chapterId },
          { method: 'post', action: '/api/bunny/headers' },
        )
      }

      return !value
    })
  }

  const uppy = useMemo(() => {
    if (requestVideoHeaders.state === 'idle' && requestVideoHeaders.data) {
      const innerUppy = new Uppy({
        restrictions: {
          maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB,
          maxNumberOfFiles: 1,
          allowedFileTypes: ['video/*'],
        },
        debug: false,
        onBeforeFileAdded: (currentFile) => {
          const now = Date.now()
          const modifiedFile = {
            ...currentFile,
            name: `${now}__${currentFile.name}`,
          }
          return modifiedFile
        },
      }).use(Tus, {
        endpoint: 'https://video.bunnycdn.com/tusupload',
        headers: {
          ...requestVideoHeaders.data.headers,
        } as unknown as Record<string, string>,
        chunkSize: 6 * 1024 * 1024,
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callback = (file: any, response: any) => {
        console.log('upload-success', file, response)
        fetcher.submit(
          {
            videoUrl: `https://iframe.mediadelivery.net/embed/${
              requestVideoHeaders.data?.headers.LibraryId
            }/${requestVideoHeaders.data?.headers.VideoId}`,
            intent: 'updateChapterVideoUrl',
          },
          { method: 'post' },
        )
      }

      innerUppy.on('upload-success', callback)

      return innerUppy
    }
  }, [requestVideoHeaders.state, requestVideoHeaders.data, fetcher])

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setIsEditing(false)
    }
  }, [fetcher.state, fetcher.data])

  return (
    <div className="mt-6 rounded-md border bg-slate-100 p-4">
      <div className="flex items-center justify-between font-medium">
        Chapter video
        <Button size="sm" variant="ghost" onClick={handleEditClick}>
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
          <iframe
            title="bunny-video"
            src={videoUrl}
            loading="lazy"
            className="absolute top-0 h-full w-full border-0"
            allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
            allowFullScreen={true}
          />
        </div>
      )}

      {isEditing && (
        <div>
          <ClientOnly
            fallback={<div className="h-[360px] w-full">Loading...</div>}
          >
            {() => uppy && <UppyDashboard uppy={uppy} />}
          </ClientOnly>

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
