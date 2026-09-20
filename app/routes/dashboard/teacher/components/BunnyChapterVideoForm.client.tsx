import { useFetcher, useRevalidator } from 'react-router';
import Uppy from '@uppy/core'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import { Dashboard as UppyDashboard } from '@uppy/react'
import Tus from '@uppy/tus'
import {
  Loader2Icon,
  PencilIcon,
  PlusCircleIcon,
  VideoIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useInterval } from 'usehooks-ts'
import { Button } from '~/components/ui/button'

interface ChapterVideoFormProps {
  videoUrl?: string | null
  videoStatus: number | null
  encodeProgress: number
}

export function BunnyChapterVideoForm({
  videoUrl,
  videoStatus,
  encodeProgress,
}: ChapterVideoFormProps) {
  const fetcher = useFetcher()
  const [isEditing, setIsEditing] = useState(false)
  const videoIdRef = useRef('')

  const revalidator = useRevalidator()
  useInterval(
    () => {
      if (revalidator.state === 'idle') {
        revalidator.revalidate()
      }
    },
    videoUrl && videoStatus !== 4 ? 3_000 : null,
  )

  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB,
        maxNumberOfFiles: 1,
        allowedFileTypes: ['video/*'],
      },
      debug: false,
    }).use(Tus, {
      endpoint: 'https://video.bunnycdn.com/tusupload',
      chunkSize: 6 * 1024 * 1024,
      async onBeforeRequest(req, file) {
        const headers = window.sessionStorage.getItem('upload-headers')
          ? JSON.parse(window.sessionStorage.getItem('upload-headers') || '')
          : null

        if (!headers) {
          const res = await fetch('/api/bunny/headers', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileName: file.name }),
          })

          if (res.ok) {
            const data = await res.json()
            console.log('onBeforeRequest', req, file, data)

            req.setHeader('VideoId', data.headers.videoId)
            req.setHeader('LibraryId', data.headers.libraryId)
            req.setHeader(
              'AuthorizationExpire',
              data.headers.authorizationExpire,
            )
            req.setHeader(
              'AuthorizationSignature',
              data.headers.authorizationSignature,
            )

            videoIdRef.current = data.headers.videoId
            window.sessionStorage.setItem(
              'upload-headers',
              JSON.stringify(data.headers),
            )
          } else {
            throw new Error('Failed to get Bunny video headers')
          }
        } else {
          videoIdRef.current = headers.videoId
          req.setHeader('VideoId', headers.videoId)
          req.setHeader('LibraryId', headers.libraryId)
          req.setHeader('AuthorizationExpire', headers.authorizationExpire)
          req.setHeader(
            'AuthorizationSignature',
            headers.authorizationSignature,
          )
        }
      },
    }),
  )

  useEffect(() => {
    const onUploadSuccess = () => {
      const videoId = videoIdRef.current

      if (videoId) {
        fetcher.submit(
          {
            videoUrl: videoId,
            intent: 'updateChapterVideoUrl',
          },
          { method: 'post' },
        )
      }

      videoIdRef.current = ''
      window.sessionStorage.removeItem('upload-headers')
    }

    const onUploadError = (_file: unknown, error: Error) => {
      console.error('upload-error', error)
      videoIdRef.current = ''
      window.sessionStorage.removeItem('upload-headers')
    }

    uppy.on('upload-success', onUploadSuccess)
    uppy.on('upload-error', onUploadError)

    return () => {
      uppy.off('upload-success', onUploadSuccess)
      uppy.off('upload-error', onUploadError)
    }
  }, [uppy, fetcher])

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
          onClick={() => setIsEditing((v) => !v)}
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
        <div className="flex h-[350px] items-center justify-center rounded-md bg-slate-200">
          <VideoIcon className="size-10 text-slate-500" />
        </div>
      ) : null}

      {!isEditing && videoUrl && videoStatus !== 4 && (
        <div className="mt-2 flex aspect-video h-[350px] flex-col items-center justify-center">
          <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
            <Loader2Icon className="mr-1 size-4 animate-spin" />
            {videoStatus === 2 && (
              <p>
                Processing your video {encodeProgress}% complete. It will appear
                shortly...
              </p>
            )}
            {videoStatus === 3 && (
              <p>
                Transcoding your video {encodeProgress}% complete. It will
                appear shortly...
              </p>
            )}
          </div>
        </div>
      )}

      {!isEditing && videoUrl && videoStatus === 4 && (
        <div className="relative mt-2 aspect-video h-[350px]">
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
          <UppyDashboard
            uppy={uppy}
            height={350}
            note="1 video file only, up to 5GB"
            hideRetryButton
            hideCancelButton
            showProgressDetails
            proudlyDisplayPoweredByUppy={false}
          />
        </div>
      )}
    </div>
  )
}
