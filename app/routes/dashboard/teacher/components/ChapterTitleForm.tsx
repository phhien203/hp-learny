import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher } from 'react-router';
import { PencilIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

export const chapterTitleFormSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(1, {
    message: 'Title is required',
  }),
})

interface ChapterTitleFormProps {
  initialData: string
}

export function ChapterTitleForm({ initialData }: ChapterTitleFormProps) {
  const [form, fields] = useForm({
    defaultValue: {
      title: initialData,
    },
    constraint: getZodConstraint(chapterTitleFormSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: chapterTitleFormSchema })
    },
  })
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
        Chapter title
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing((value) => !value)}
        >
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <PencilIcon className="mr-2 size-4" />
              Edit
            </>
          )}
        </Button>
      </div>

      {!isEditing ? <p className="mt-2 text-sm">{initialData}</p> : null}

      {isEditing ? (
        <fetcher.Form
          method="post"
          className="mt-4 space-y-4"
          {...getFormProps(form)}
        >
          <div>
            <Input
              placeholder="e.g. Introduction to the course"
              {...getInputProps(fields.title, { type: 'text' })}
              defaultValue={initialData}
              disabled={fetcher.state !== 'idle'}
            />

            <div className="mt-2 h-4 text-xs text-red-500">
              {fields.title.errors}
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <Button
              type="submit"
              name="intent"
              value="updateChapterTitle"
              disabled={fetcher.state !== 'idle'}
            >
              {fetcher.state !== 'idle' ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </fetcher.Form>
      ) : null}
    </div>
  )
}
