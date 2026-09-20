import { useSyncExternalStore, type ReactNode } from 'react'

function subscribe() {
  return () => {}
}

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: () => ReactNode
  fallback?: ReactNode
}) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)

  return hydrated ? children() : fallback
}
