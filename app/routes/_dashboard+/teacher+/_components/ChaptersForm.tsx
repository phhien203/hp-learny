import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher, useNavigate } from '@remix-run/react'
import { Loader2Icon, PlusCircleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { ChaptersList } from './ChaptersList'
import { Input } from '../../../../components/ui/input'

export const chaptersFormSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(1, {
    message: 'Title is required',
  }),
})

interface ChaptersFormProps {
  initialData: {
    chapters: {
      id: string
      title: string
      isPublished: boolean
      isFree: boolean
    }[]
  }
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
  const reorderFetcher = useFetcher()
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setIsCreating(false)
    }
  }, [fetcher.state, fetcher.data])

  useEffect(() => {
    if (reorderFetcher.state === 'idle' && reorderFetcher.data) {
      setIsUpdating(false)
    }
  }, [reorderFetcher.state, reorderFetcher.data])

  const onReorder = (bulkUpdateData: { id: string; position: number }[]) => {
    setIsUpdating(true)

    reorderFetcher.submit(
      { list: JSON.stringify(bulkUpdateData) },
      {
        method: 'post',
        action: `/api/courses/${courseId}/chapters/reorder`,
      },
    )
  }

  const onEdit = async (chapterId: string) => {
    navigate(`/teacher/courses/${courseId}/chapters/${chapterId}`)
  }

  return (
    <div className="relative mt-6 rounded-md border bg-slate-100 p-4">
      {isUpdating && (
        <div className="absolute right-0 top-0 flex h-full w-full items-center justify-center bg-slate-500/20">
          <Loader2Icon className="size-6 animate-spin text-sky-700" />
        </div>
      )}

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
              disabled={fetcher.state !== 'idle'}
            />

            <div className="mt-2 h-4 text-xs text-red-500">
              {fields.title.errors}
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <Button type="submit" disabled={fetcher.state !== 'idle'}>
              {fetcher.state !== 'idle' ? 'Creating...' : 'Create'}
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

          <ChaptersList
            items={initialData.chapters}
            onEdit={onEdit}
            onReorder={onReorder}
          />
        </div>
      )}

      {!isCreating && (
        <p className="mt-4 text-xs text-muted-foreground">
          Drag and drop to reorder the chapters
        </p>
      )}
    </div>
  )
}
