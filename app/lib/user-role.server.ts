import { getAuth } from '@clerk/react-router/server'
import { LoaderFunctionArgs } from 'react-router';

export async function isTeacher(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  return userId
    ? (process.env.TEACHER_USER_IDS || '').split(',').includes(userId)
    : false
}

export function isWhitelistedUser(email: string) {
  if (process.env.ENABLE_WHITELIST !== 'true') {
    return true
  }

  return (process.env.USER_EMAIL_WHITELIST || '')
    .split(',')
    .includes(email.trim())
}
