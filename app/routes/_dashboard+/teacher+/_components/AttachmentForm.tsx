import { useFetcher } from '@remix-run/react'
import { FileIcon, Loader2, PlusCircleIcon, TrashIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { UppyFileUpload } from './UppyFileUpload'

export const attachmentFormSchema = z.object({
  url: z.string().min(1),
  name: z.string().min(1),
})

interface AttachmentFormProps {
  initialData: {
    attachments: {
      id: string
      name: string
      url: string
    }[]
  }
  courseId: string
}

export function AttachmentForm({ initialData, courseId }: AttachmentFormProps) {
  const fetcher = useFetcher()
  const deleteAttachmentFetcher = useFetcher({ key: 'delete-attachment' })
  const [isEditing, setIsEditing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setIsEditing(false)
    }
  }, [fetcher.state, fetcher.data])

  useEffect(() => {
    if (
      deleteAttachmentFetcher.state === 'idle' &&
      deleteAttachmentFetcher.data
    ) {
      setDeletingId(null)
    }
  }, [deleteAttachmentFetcher.state, deleteAttachmentFetcher.data])

  return (
    <div className="mt-6 rounded-md border bg-slate-100 p-4">
      <div className="flex items-center justify-between font-medium">
        Course attachments
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing((value) => !value)}
        >
          {isEditing && <>Cancel</>}

          {!isEditing && (
            <>
              <PlusCircleIcon className="mr-2 size-4" />
              Add an attachment
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <>
          {initialData.attachments.length === 0 && (
            <p className="mt-2 text-sm italic text-slate-500">
              No attachments yet
            </p>
          )}
          {initialData.attachments.length > 0 && (
            <div className="space-y-2">
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex w-full items-center rounded-md border border-sky-200 bg-sky-100 p-3 text-sky-700"
                >
                  <FileIcon className="mr-2 size-4 flex-shrink-0" />
                  <p className="line-clamp-1 text-sm" title={attachment.name}>
                    <a href={attachment.url} target="_blank" rel="noreferrer">
                      {attachment.name}
                    </a>
                  </p>

                  {deletingId === attachment.id && (
                    <Loader2 className="ml-auto size-4 animate-spin" />
                  )}

                  {deletingId !== attachment.id && (
                    <button
                      className="ml-auto transition hover:opacity-75"
                      onClick={() => {
                        setDeletingId(attachment.id)
                        deleteAttachmentFetcher.submit(
                          {},
                          {
                            method: 'delete',
                            action: `/api/courses/${courseId}/attachments/${attachment.id}`,
                          },
                        )
                      }}
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isEditing && (
        <div>
          <UppyFileUpload
            onChange={({ fileUrl, fileName }) => {
              if (fileUrl) {
                fetcher.submit(
                  { url: fileUrl, name: fileName },
                  {
                    method: 'POST',
                    action: `/api/courses/${courseId}/attachments`,
                  },
                )
              }
            }}
          />

          <div className="mt-4 text-xs text-muted-foreground">
            Add anything your students might need to complete the course.
          </div>
        </div>
      )}
    </div>
  )
}
