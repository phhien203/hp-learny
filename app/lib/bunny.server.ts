import crypto from 'crypto'

export function signVideoUrl(unsignedVideoUrl: string) {
  const parsedUrl = new URL(unsignedVideoUrl)

  const pathSegments = parsedUrl.pathname.split('/') // Example: ['', 'embed', '228530', 'cbf30637-b0de-4f8f-9e43-2199a5c5e967']
  const videoId = pathSegments[3]
  const expires =
    Math.floor(new Date().valueOf() / 1000) +
    parseInt(process.env.BUNNY_VIDEO_EXPIRES_SECONDS || '600') // 10 minutes
  const data = `${process.env.BUNNY_TOKEN}${videoId}${expires}`
  const hash = crypto.createHash('sha256')
  const token = hash.update(data).digest('hex')

  parsedUrl.searchParams.set('token', token)
  parsedUrl.searchParams.set('expires', expires.toString())
  const signedVideoUrl = parsedUrl.toString()

  return signedVideoUrl
}

export async function createBunnyVideo(chapterTitle: string) {
  const bunnyLibraryId = process.env.BUNNY_LIBRARY_ID
  const bunnyApiKey = process.env.BUNNY_API_KEY

  if (!bunnyLibraryId || !bunnyApiKey) {
    console.error('Bunny environment variables are not set')
    throw new Error('Bunny environment variables are not set')
  }

  const url = `${process.env.BUNNY_UPLOAD_URL}/${bunnyLibraryId}/videos`
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      AccessKey: `${bunnyApiKey}`,
    },
    body: JSON.stringify({
      title: `${chapterTitle}_${new Date().getTime()}`,
    }),
  }

  const bunnyResponse = await fetch(url, options)

  if (!bunnyResponse.ok) {
    console.error('Failed to create Bunny video', bunnyResponse)
    throw new Error('Failed to create Bunny video')
  }

  const bunnyData = await bunnyResponse.json()

  const videoId: string = bunnyData.guid

  return videoId
}
