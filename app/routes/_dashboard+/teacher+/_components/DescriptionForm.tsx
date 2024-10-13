import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher } from '@remix-run/react'
import { PencilIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Textarea } from '../../../../components/ui/textarea'
import { cn } from '~/lib/utils'

export const descriptionFormSchema = z.object({
  description: z.string({ required_error: 'Description is required' }).min(1, {
    message: 'Description is required',
  }),
})

interface DescriptionFormProps {
  initialData?: string | null
}

export function DescriptionForm({ initialData }: DescriptionFormProps) {
  const [form, fields] = useForm({
    defaultValue: {
      description: initialData ?? '',
    },
    constraint: getZodConstraint(descriptionFormSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: descriptionFormSchema })
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
        Course description
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

      {!isEditing && (
        <p
          className={cn(
            'mt-2 text-sm',
            !initialData && 'italic text-slate-500',
          )}
        >
          {initialData ?? 'No description'}
        </p>
      )}

      {isEditing ? (
        <fetcher.Form
          method="post"
          className="mt-4 space-y-4"
          {...getFormProps(form)}
        >
          <div>
            <Textarea
              placeholder="e.g. This course is about..."
              {...getInputProps(fields.description, { type: 'text' })}
              defaultValue={initialData ?? ''}
              disabled={
                fetcher.state === 'submitting' || fetcher.state === 'loading'
              }
            />

            <div className="mt-2 h-4 text-xs text-red-500">
              {fields.description.errors}
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <Button
              type="submit"
              name="intent"
              value="updateDescription"
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
