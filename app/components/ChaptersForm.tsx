import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher } from '@remix-run/react'
import { PlusCircleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from './ui/input'
import { cn } from '~/lib/utils'

export const chaptersFormSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(1, {
    message: 'Title is required',
  }),
})

interface ChaptersFormProps {
  initialData: { chapters: { id: string; title: string }[] }
  courseId: string
}

export function ChaptersForm({ initialData, courseId }: ChaptersFormProps) {
  const [form, fields] = useForm({
    defaultValue: {
      title: '',
    },
    constraint: getZodConstraint(chaptersFormSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: chaptersFormSchema })
    },
  })
  const fetcher = useFetcher()
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setIsCreating(false)
    }
  }, [fetcher.state, fetcher.data])

  return (
    <div className="mt-6 rounded-md border bg-slate-100 p-4">
      <div className="flex items-center justify-between font-medium">
        Course chapters
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsCreating((value) => !value)}
        >
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircleIcon className="mr-2 size-4" />
              New chapter
            </>
          )}
        </Button>
      </div>

      {isCreating ? (
        <fetcher.Form
          method="post"
          action={`/api/courses/${courseId}/chapters`}
          className="mt-4 space-y-4"
          {...getFormProps(form)}
        >
          <div>
            <Input
              placeholder="e.g. Introduction to the course"
              {...getInputProps(fields.title, { type: 'text' })}
              disabled={
                fetcher.state === 'submitting' || fetcher.state === 'loading'
              }
            />

            <div className="mt-2 h-4 text-xs text-red-500">
              {fields.title.errors}
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <Button
              type="submit"
              disabled={
                fetcher.state === 'submitting' || fetcher.state === 'loading'
              }
            >
              Create
            </Button>
          </div>
        </fetcher.Form>
      ) : null}

      {!isCreating && (
        <div
          className={cn(
            'mt-2 text-sm',
            !initialData.chapters.length && 'italic text-slate-500',
          )}
        >
          {!initialData.chapters.length && 'No chapters'}
        </div>
      )}

      {!isCreating &&
        initialData.chapters.map((chapter) => (
          <div key={chapter.id}>{chapter.title}</div>
        ))}

      {!isCreating && (
        <p className="mt-4 text-xs text-muted-foreground">
          Drag and drop to reorder the chapters
        </p>
      )}
    </div>
  )
}
