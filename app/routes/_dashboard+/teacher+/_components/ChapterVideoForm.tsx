import MuxPlayer from '@mux/mux-player-react'
import { useFetcher } from 'react-router';
import Uppy from '@uppy/core'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import { Dashboard as DB } from '@uppy/react'
import Tus from '@uppy/tus'
import { PencilIcon, PlusCircleIcon, VideoIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsY3J2eHZkaGJheHVxdnV0bHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzOTM2NDYsImV4cCI6MjA0Mzk2OTY0Nn0.fvZPkWO6MmwTD9yzYXwQ5loWhqTubdP3DOrkQW_PLWo'
const projectId = 'xlcrvxvdhbaxuqvutlrz'
const bucketName = 'pet-lms'
const folderName = ''
const supabaseUploadURL = `https://${projectId}.supabase.co/storage/v1/upload/resumable`

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

  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB,
        maxNumberOfFiles: 1,
        allowedFileTypes: ['video/*'],
      },
      debug: false,
      onBeforeFileAdded: (currentFile) => {
        // console.log('currentFile', currentFile)
        const now = Date.now()
        const modifiedFile = {
          ...currentFile,
          name: `${now}__${currentFile.name}`,
          // name: `${chapterId}`,
        }
        // console.log('modifiedFile', modifiedFile)
        return modifiedFile
      },
    }).use(Tus, {
      endpoint: supabaseUploadURL,
      headers: {
        authorization: `Bearer ${token}`,
      },
      chunkSize: 6 * 1024 * 1024,
      allowedMetaFields: [
        'bucketName',
        'objectName',
        'contentType',
        'cacheControl',
      ],
    }),
  )

  uppy.on('file-added', (file) => {
    file.meta = {
      ...file.meta,
      bucketName: bucketName,
      objectName: folderName ? `${folderName}/${file.name}` : file.name,
      contentType: file.type,
    }
  })

  uppy.on('upload-success', (file, response) => {
    console.log('upload-success', file, response)
    // console.log('uppy.getState()', uppy.getState())
    fetcher.submit(
      {
        videoUrl: file?.name || '',
        intent: 'updateChapterVideoUrl',
      },
      { method: 'post' },
    )
  })

  // uppy.on('complete', (result) => {
  // console.log('complete', uppy.getState())
  //   console.log("Upload complete! We've uploaded these files:", result)
  //   fetcher.submit(
  //     {
  //       videoUrl: result.successful?.[0]?.name || '',
  //       intent: 'updateChapterVideoUrl',
  //     },
  //     { method: 'post' },
  //   )
  //   uppy.clear()
  // })

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setIsEditing(false)
    }
  }, [fetcher.state, fetcher.data])

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

          {/* <UppyFileUpload /> */}
          <DB uppy={uppy} />

          {/* <fetcher.Form
            id="chapter-video-form"
            encType="multipart/form-data"
            method="post"
          >
            <input name="video" type="file" />
            <Button type="submit">Upload Video</Button>
          </fetcher.Form> */}

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
