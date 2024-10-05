import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher } from '@remix-run/react'
import { PencilIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

export const titleFormSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(1, {
    message: 'Title is required',
  }),
})

interface TitleFormProps {
  initialData: string
}

export function TitleForm({ initialData }: TitleFormProps) {
  const [form, fields] = useForm({
    defaultValue: {
      title: initialData,
    },
    constraint: getZodConstraint(titleFormSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: titleFormSchema })
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
        Course title

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
              Edit title
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
              placeholder="e.g. 'Advanced web development'"
              {...getInputProps(fields.title, { type: 'text' })}
              defaultValue={initialData}
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
              name="intent"
              value="updateTitle"
              disabled={
                fetcher.state === 'submitting' || fetcher.state === 'loading'
              }
            >
              Save
            </Button>
          </div>
        </fetcher.Form>
      ) : null}
    </div>
  )
}
