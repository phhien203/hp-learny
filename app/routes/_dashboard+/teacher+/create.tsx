import { getAuth } from '@clerk/remix/ssr.server'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, json, redirect } from 'react-router';
import { Form, Link } from 'react-router';
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { db } from '~/lib/db.server'
import { isTeacher } from '~/lib/user-role.server'

const schema = z.object({
  title: z.string({
    required_error: 'Title is required',
  }),
})

export const action = async (args: ActionFunctionArgs) => {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }

  const teacherRole = await isTeacher(args)

  if (!teacherRole) {
    return redirect('/search')
  }

  const formData = await args.request.formData()
  const submission = parseWithZod(formData, { schema })

  if (submission.status !== 'success') {
    return json(submission.reply())
  }

  try {
    const course = await db.course.create({
      data: {
        title: submission.value.title,
        userId,
      },
    })

    return redirect(`/teacher/courses/${course.id}`)
  } catch {
    return json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export default function TeacherCreatePage() {
  const [form, fields] = useForm({
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <div className="mx-auto flex h-full max-w-5xl p-6 md:items-center md:justify-center">
      <div>
        <h1 className="text-2xl">Name your course</h1>

        <p className="text-sm text-slate-600">
          What would you like to name your course? Don&apos;t worry, you can
          change it later.
        </p>

        <Form method="post" className="mt-8 space-y-6" {...getFormProps(form)}>
          <div>
            <Label htmlFor={fields.title.id}>Course Title</Label>

            <Input
              {...getInputProps(fields.title, {
                type: 'text',
              })}
              placeholder="e.g. 'The Complete Web Developer Course'"
              className="mt-2"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />

            <div className="mt-2 h-4 text-xs text-red-500">
              {fields.title.errors}
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <Link to="/">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>

            <Button type="submit" disabled={!form.valid}>
              Continue
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
