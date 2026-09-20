import { createClerkClient, type User } from '@clerk/react-router/api.server'

export async function getUser(userId: string): Promise<User | null> {
  return await createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  }).users.getUser(userId)
}

export async function getUserEmail(userId: string): Promise<string | null> {
  const user = await getUser(userId)
  return user?.emailAddresses?.[0]?.emailAddress || null
}
