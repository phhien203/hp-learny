import { getAuth } from '@clerk/remix/ssr.server'
import {
  redirect,
  type LoaderFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'Thiện Số Học' },
    { name: 'description', content: 'Khóa học online về Thiện Số Học' },
  ]
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/sign-in')
  }

  return redirect('/search')
}

export default function Index() {
  return (
    <div>
      <h1>Index Route</h1>
    </div>
  )
}
