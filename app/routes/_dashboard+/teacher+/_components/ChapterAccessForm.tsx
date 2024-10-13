import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher } from '@remix-run/react'
import { PencilIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { Checkbox } from '../../../../components/ui/checkbox'

export const chapterAccessFormSchema = z.object({
  isFree: z.coerce.boolean().default(false),
})

interface ChapterAccessFormProps {
  initialData: boolean
}

export function ChapterAccessForm({ initialData }: ChapterAccessFormProps) {
  const [form, fields] = useForm({
    defaultValue: {
      isFree: !!initialData,
    },
    constraint: getZodConstraint(chapterAccessFormSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: chapterAccessFormSchema })
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
        Chapter access
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
          {initialData ? (
            <>This chapter is free for preview</>
          ) : (
            <>This chapter is private</>
          )}
        </p>
      )}

      {isEditing ? (
        <fetcher.Form
          method="post"
          className="mt-4 space-y-4"
          {...getFormProps(form)}
        >
          <div>
            {/* <input
              {...getInputProps(fields.isFree, { type: 'checkbox' })}
              defaultChecked={Boolean(initialData)}
            /> */}

            <Checkbox
              id={fields.isFree.id}
              name={fields.isFree.name}
              defaultChecked={Boolean(initialData)}
            />

            <label
              htmlFor={fields.isFree.id}
              className="ml-2 text-sm font-medium leading-none"
            >
              Check this box if you want to make this chapter free for preview
            </label>
          </div>

          <div className="flex items-center gap-x-2">
            <Button
              type="submit"
              name="intent"
              value="updateChapterAccess"
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
