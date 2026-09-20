import { getAuth } from '@clerk/react-router/server'
import { redirect, type LoaderFunctionArgs, type MetaFunction } from 'react-router'

export const meta: MetaFunction = () => {
  return [{ title: 'PET LMS' }, { name: 'description', content: 'PET LMS' }]
}

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/sign-in')
  }

  return redirect('/search')
}

export default function Dashboard() {
  return null
}
