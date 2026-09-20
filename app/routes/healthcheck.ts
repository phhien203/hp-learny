import { db } from '~/lib/db.server'

export const loader = async () => {
  try {
    await db.course.count()
    return new Response('OK')
  } catch (error: unknown) {
    console.error('healthcheck failed', error)
    return new Response('ERROR', { status: 500 })
  }
}
