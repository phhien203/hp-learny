import { ActionFunctionArgs, json } from 'react-router';
import crypto from 'crypto'
import { createBunnyVideo } from '~/lib/bunny.server'

export async function action(args: ActionFunctionArgs) {
  try {
    const body = await args.request.json()
    const fileName = body.fileName as string

    if (!fileName) {
      throw new Error('File name is required')
    }

    const videoId = await createBunnyVideo(fileName)

    const now = Math.floor(new Date().valueOf() / 1000)
    const expiration = 3600 // 1 hour
    const expires = now + expiration

    const data = `${process.env.BUNNY_LIBRARY_ID}${process.env.BUNNY_API_KEY}${expires}${videoId}`
    const hash = crypto.createHash('sha256')
    const token = hash.update(data).digest('hex')

    return json({
      headers: {
        videoId: videoId,
        libraryId: process.env.BUNNY_LIBRARY_ID!,
        authorizationExpire: expires,
        authorizationSignature: token,
      },
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}
