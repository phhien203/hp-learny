import { ClerkProvider } from '@clerk/react-router'
import { clerkMiddleware, rootAuthLoader } from '@clerk/react-router/server'
import type { Route } from './+types/root'
import { data, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { useEffect } from 'react'
import { toast as notify, Toaster } from 'react-hot-toast'
import { getToast } from 'remix-toast'
import './tailwind.css'
// import 'quill/dist/quill.snow.css'

export const links: Route.LinksFunction = () => [
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

export const middleware: Route.MiddlewareFunction[] = [clerkMiddleware()]

export function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args, async () => {
    const { toast, headers } = await getToast(args.request)
    return data({ toast }, { headers })
  })
}

export function Layout({ children }: { children: React.ReactNode }) {
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

export default function App({ loaderData }: Route.ComponentProps) {
  const { toast } = loaderData

  useEffect(() => {
    if (toast?.type === 'success') {
      notify.success(toast.message)
    } else if (toast?.type === 'error') {
      notify.error(toast.message)
    }
  }, [toast])

  return (
    <ClerkProvider loaderData={loaderData}>
      <Outlet />
    </ClerkProvider>
  )
}
