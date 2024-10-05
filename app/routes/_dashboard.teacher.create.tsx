import { ActionFunctionArgs, json, redirect } from '@remix-run/node'
import * as z from 'zod'

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Title is required',
  }),
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const title = formData.get('title')

  try {
    // const response = await axios.post('/api/courses', { title })
    return redirect(`/teacher/courses/${'123'}`)
  } catch {
    return json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export default function TeacherCreatePage() {
  return (
    <div className="mx-auto flex h-full max-w-5xl p-6 md:items-center md:justify-center">
      <div>
        <h1 className="text-2xl">Name your course</h1>

        <p className="text-sm text-slate-600">
          What would you like to name your course? Don&apos;t worry, you can
          change it later.
        </p>
      </div>
    </div>
  )
}
