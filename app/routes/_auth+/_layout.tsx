import { Outlet } from 'react-router';

export default function AuthLayout() {
  return (
    <div className="flex h-full items-center justify-center">
      <Outlet />
    </div>
  )
}
