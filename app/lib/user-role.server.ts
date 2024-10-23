import { getAuth } from '@clerk/remix/ssr.server'
import { LoaderFunctionArgs } from '@remix-run/node'

export async function isTeacher(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  return userId
    ? (process.env.TEACHER_USER_IDS || '').split(',').includes(userId)
    : false
}

export function isWhitelistedUser(email: string) {
  return (process.env.USER_EMAIL_WHITELIST || '')
    .split(',')
    .includes(email.trim())
}
