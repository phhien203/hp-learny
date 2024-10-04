import type { MetaFunction } from '@remix-run/node'
import { Button } from '~/components/ui/button'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export default function Index() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-400 underline">
        Hello World
      </h1>
      <Button variant="destructive">Click me</Button>
    </div>
  )
}
