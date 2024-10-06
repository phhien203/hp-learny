import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher } from '@remix-run/react'
import { PencilIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { Combobox } from './ui/combobox'

export const categoryFormSchema = z.object({
  categoryId: z.string({ required_error: 'Category is required' }).min(1, {
    message: 'Category is required',
  }),
})

interface CategoryFormProps {
  initialData?: string | null
  options: { value: string; label: string }[]
}

export function CategoryForm({ initialData, options }: CategoryFormProps) {
  const [form, fields] = useForm({
    defaultValue: {
      categoryId: initialData ?? '',
    },
    constraint: getZodConstraint(categoryFormSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: categoryFormSchema })
    },
  })
  const fetcher = useFetcher()
  const [isEditing, setIsEditing] = useState(false)

  const selectedCategory = options.find(
    (option) => option.value === initialData,
  )

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setIsEditing(false)
    }
  }, [fetcher.state, fetcher.data])

  return (
    <div className="mt-6 rounded-md border bg-slate-100 p-4">
      <div className="flex items-center justify-between font-medium">
        Course category
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
            !selectedCategory && 'italic text-slate-500',
          )}
        >
          {selectedCategory?.label ?? 'No category'}
        </p>
      )}

      {isEditing ? (
        <fetcher.Form
          method="post"
          className="mt-4 space-y-4"
          {...getFormProps(form)}
        >
          <div>
            {/* <select
              {...getSelectProps(fields.categoryId)}
              defaultValue={initialData ?? ''}
            >
              {options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  selected={option.value === initialData}
                >
                  {option.label}
                </option>
              ))}
            </select> */}

            <Combobox
              options={options}
              value={initialData ?? ''}
              onChange={(value) => {
                fetcher.submit(
                  { categoryId: value, intent: 'updateCategory' },
                  { method: 'post' },
                )
              }}
            />

            <div className="mt-2 h-4 text-xs text-red-500">
              {fields.categoryId.errors}
            </div>
          </div>

          {/* <div className="flex items-center gap-x-2">
            <Button
              type="submit"
              name="intent"
              value="updateCategory"
              disabled={
                fetcher.state === 'submitting' || fetcher.state === 'loading'
              }
            >
              Save
            </Button>
          </div> */}
        </fetcher.Form>
      ) : null}
    </div>
  )
}
