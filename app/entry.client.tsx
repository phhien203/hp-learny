import { HydratedRouter } from 'react-router/dom'
import posthog from 'posthog-js'
import { startTransition, StrictMode, useEffect } from 'react'
import { hydrateRoot } from 'react-dom/client'

function PosthogInit() {
  useEffect(() => {
    posthog.init('phc_7L4nhfNzYSrgitNwZPphoRanJL6Wmt0ncUctLWQ9Ncf', {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
    })
  }, [])

  return null
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
      <PosthogInit />
    </StrictMode>,
  )
})
