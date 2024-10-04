import { Outlet } from '@remix-run/react'

export default function AuthLayout() {
  return (
    <div className="flex h-full items-center justify-center">
      <Outlet />
    </div>
  )
}
