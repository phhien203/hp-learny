import crypto from 'crypto'

export function signVideoUrl(videoId: string) {
  const url = new URL(
    `https://iframe.mediadelivery.net/embed/${process.env.BUNNY_LIBRARY_ID}/${videoId}`,
  )

  const expires =
    Math.floor(new Date().valueOf() / 1000) +
    parseInt(process.env.BUNNY_VIDEO_EXPIRES_SECONDS || '600') // 10 minutes
  const data = `${process.env.BUNNY_TOKEN}${videoId}${expires}`
  const hash = crypto.createHash('sha256')
  const token = hash.update(data).digest('hex')

  url.searchParams.set('token', token)
  url.searchParams.set('expires', expires.toString())
  const signedVideoUrl = url.toString()

  return signedVideoUrl
}

export async function getBunnyVideoStatus(videoId: string) {
  const url = `${process.env.BUNNY_UPLOAD_URL}/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      AccessKey: `${process.env.BUNNY_API_KEY}`,
    },
  })

  if (!response.ok) {
    console.error('Failed to get Bunny video status', response)
    return null
  }

  const data = await response.json()

  return [data.status as number, (data.encodeProgress as number) || 0] as const
}

export async function deleteBunnyVideo(videoId: string) {
  try {
    const url = `${process.env.BUNNY_UPLOAD_URL}/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        AccessKey: `${process.env.BUNNY_API_KEY}`,
      },
    })

    if (!response.ok) {
      console.warn('Delete Bunny video not successful', response)
    }

    console.log('Deleted Bunny video', response)
  } catch (error) {
    console.warn('Failed to delete Bunny video', error)
  }
}

export async function createBunnyVideo(fileName: string) {
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
      title: fileName,
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
