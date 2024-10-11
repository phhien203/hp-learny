import { ActionFunctionArgs, json } from '@remix-run/node'
import crypto from 'crypto'

export async function action(args: ActionFunctionArgs) {
  try {
    const formData = await args.request.formData()
    const title = formData.get('title')

    if (!title) {
      throw new Error('Title is required')
    }

    const bunnyLibraryId = process.env.BUNNY_LIBRARY_ID
    const bunnyApiKey = process.env.BUNNY_API_KEY

    if (!bunnyLibraryId || !bunnyApiKey) {
      console.error('Bunny environment variables are not set')
      throw new Error('Bunny environment variables are not set')
    }

    const url = `https://video.bunnycdn.com/library/${bunnyLibraryId}/videos`
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        AccessKey: `${bunnyApiKey}`,
      },
      body: JSON.stringify({
        title: title,
      }),
    }

    const bunnyResponse = await fetch(url, options)
    const bunnyData = await bunnyResponse.json()

    const videoId: string = bunnyData.guid

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
