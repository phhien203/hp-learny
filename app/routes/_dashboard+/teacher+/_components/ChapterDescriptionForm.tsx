import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher } from 'react-router';
import { PencilIcon } from 'lucide-react'
// import quillCss from 'quill/dist/quill.snow.css'
import { useEffect, useState } from 'react'
// import { ClientOnly } from 'remix-utils/client-only'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
// import Preview from './Preview.client'
import { Textarea } from '../../../../components/ui/textarea'

// export const links = () => [{ rel: 'stylesheet', href: quillCss }]

export const chapterDescriptionFormSchema = z.object({
  description: z.string().min(1),
})

interface ChapterDescriptionFormProps {
  initialData?: string | null
}

export function ChapterDescriptionForm({
  initialData,
}: ChapterDescriptionFormProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [form, fields] = useForm({
    defaultValue: {
      description: initialData ?? '',
    },
    constraint: getZodConstraint(chapterDescriptionFormSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: chapterDescriptionFormSchema })
    },
  })
  const fetcher = useFetcher()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setIsEditing(false)
    }
  }, [fetcher.state, fetcher.data])

  if (!isMounted) return null

  return (
    (<div className="mt-6 rounded-md border bg-slate-100 p-4">
      <div className="flex items-center justify-between font-medium">
        Chapter description
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
        <div
          className={cn(
            'mt-2 text-sm',
            !initialData && 'italic text-slate-500',
          )}
        >
          {!initialData && 'No description'}

          {initialData && (
            // <ClientOnly
            //   fallback={<div style={{ width: 500, height: 300 }}></div>}
            // >
            //   {() => <Preview defaultValue={initialData ?? ''} />}
            // </ClientOnly>
            (<div>{initialData}</div>)
          )}
        </div>
      )}
      {isEditing ? (
        <fetcher.Form
          method="post"
          className="mt-4 space-y-4"
          {...getFormProps(form)}
        >
          <div>
            <Textarea
              name={fields.description.name}
              defaultValue={initialData ?? ''}
            />

            {/* <ClientOnly
              fallback={<div style={{ width: 500, height: 300 }}></div>}
            >
              {() => (
                <Quill
                  name={fields.description.name}
                  defaultValue={initialData ?? ''}
                />
              )}
            </ClientOnly> */}

            <div className="mt-2 h-4 text-xs text-red-500">
              {fields.description.errors}
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <Button
              type="submit"
              name="intent"
              value="updateChapterDescription"
              disabled={fetcher.state !== 'idle'}
            >
              {fetcher.state !== 'idle' ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </fetcher.Form>
      ) : null}
    </div>)
  );
}
