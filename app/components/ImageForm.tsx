import { useFetcher } from '@remix-run/react'
import { ImageIcon, PencilIcon, PlusCircleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { FileUpload } from './FileUpload'
import { z } from 'zod'

export const imageFormSchema = z.object({
  imageUrl: z.string({ required_error: 'Image is required' }).min(1, {
    message: 'Image is required',
  }),
})

interface ImageFormProps {
  initialData: {
    imageUrl: string | null
  }
}

export function ImageForm({ initialData }: ImageFormProps) {
  const fetcher = useFetcher()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setIsEditing(false)
    }
  }, [fetcher.state, fetcher.data])

  return (
    <div className="mt-6 rounded-md border bg-slate-100 p-4">
      <div className="flex items-center justify-between font-medium">
        Course image
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing((value) => !value)}
        >
          {isEditing && <>Cancel</>}

          {!isEditing && !initialData?.imageUrl && (
            <>
              <PlusCircleIcon className="mr-2 size-4" />
              Add an image
            </>
          )}

          {!isEditing && initialData.imageUrl && (
            <>
              <PencilIcon className="mr-2 size-4" />
              Edit
            </>
          )}
        </Button>
      </div>

      {!isEditing && !initialData?.imageUrl ? (
        <div className="flex h-60 items-center justify-center rounded-md bg-slate-200">
          <ImageIcon className="size-10 text-slate-500" />
        </div>
      ) : null}

      {!isEditing && initialData?.imageUrl && (
        <div className="relative mt-2 aspect-video">
          <img
            src={initialData.imageUrl}
            alt="Course"
            className="aspect-video rounded-md object-cover"
          />
        </div>
      )}

      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseImage"
            onChange={(imageUrl) => {
              if (imageUrl) {
                fetcher.submit(
                  { imageUrl, intent: 'updateImage' },
                  { method: 'post' },
                )
              }
            }}
          />

          <div className="mt-4 text-xs text-muted-foreground">
            16:9 aspect ratio recommended
          </div>
        </div>
      )}
    </div>
  )
}
