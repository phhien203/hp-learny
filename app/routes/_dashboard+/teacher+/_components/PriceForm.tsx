import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher } from '@remix-run/react'
import { PencilIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { Input } from '../../../../components/ui/input'
import { formatPrice } from '~/lib/format'

export const priceFormSchema = z.object({
  price: z.coerce.number(),
})

interface PriceFormProps {
  initialData?: number | null
}

export function PriceForm({ initialData }: PriceFormProps) {
  const [form, fields] = useForm({
    defaultValue: {
      price: initialData || 0,
    },
    constraint: getZodConstraint(priceFormSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: priceFormSchema })
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
        Course price
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
          {initialData ? formatPrice(initialData) : 'No price'}
        </p>
      )}

      {isEditing ? (
        <fetcher.Form
          method="post"
          className="mt-4 space-y-4"
          {...getFormProps(form)}
        >
          <div>
            <Input
              step={0.01}
              placeholder="e.g. 9.99"
              {...getInputProps(fields.price, { type: 'number' })}
              defaultValue={initialData || 0}
              disabled={
                fetcher.state === 'submitting' || fetcher.state === 'loading'
              }
            />

            <div className="mt-2 h-4 text-xs text-red-500">
              {fields.price.errors}
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <Button
              type="submit"
              name="intent"
              value="updatePrice"
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
