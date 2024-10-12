import { ActionFunctionArgs, json } from '@remix-run/node'
import crypto from 'crypto'
import { createBunnyVideo } from '~/lib/bunny.server'

export async function action(args: ActionFunctionArgs) {
  try {
    const formData = await args.request.formData()
    const title = formData.get('title') as string

    if (!title) {
      throw new Error('Title is required')
    }

    const videoId = await createBunnyVideo(title)

    const now = Math.floor(new Date().valueOf() / 1000)
    const expiration = 3600 // 1 hour
    const expires = now + expiration

    const data = `${process.env.BUNNY_LIBRARY_ID}${process.env.BUNNY_API_KEY}${expires}${videoId}`
    const hash = crypto.createHash('sha256')
    const token = hash.update(data).digest('hex')

    return json({
      headers: {
        VideoId: videoId,
        LibraryId: process.env.BUNNY_LIBRARY_ID!,
        AuthorizationExpire: expires,
        AuthorizationSignature: token,
      },
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}
