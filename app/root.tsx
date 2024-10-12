import { ClerkApp } from '@clerk/remix'
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import type {
  LinksFunction,
  LoaderFunction,
  LoaderFunctionArgs,
} from '@remix-run/node'
import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import { useEffect } from 'react'
import { toast as notify, Toaster } from 'react-hot-toast'
import { getToast } from 'remix-toast'
import './tailwind.css'
// import 'quill/dist/quill.snow.css'

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

export const loader: LoaderFunction = (args: LoaderFunctionArgs) => {
  return rootAuthLoader(args, async () => {
    const { toast, headers } = await getToast(args.request)
    return json({ toast }, { headers })
  })
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { toast } = useLoaderData<typeof loader>()

  useEffect(() => {
    if (toast) {
      if (toast.type === 'success') {
        notify.success(toast.message)
      } else if (toast.type === 'error') {
        notify.error(toast.message)
      }
    }
  }, [toast])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

function App() {
  return <Outlet />
}

export default ClerkApp(App)
