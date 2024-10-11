import { getAuth } from '@clerk/remix/ssr.server'
import { ActionFunctionArgs, json } from '@remix-run/node'

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await args.request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return json({ error: 'No file uploaded' }, { status: 400 })
  }

  const REGION = 'sg' // e.g., 'ny' for New York
  const STORAGE_ZONE_NAME = 'pet-lms'
  const ACCESS_KEY = process.env.BUNNY_STORAGE_API_KEY
  const FILENAME = file.name

  const base_url = REGION
    ? `${REGION}.storage.bunnycdn.com`
    : 'storage.bunnycdn.com'
  const url = `https://${base_url}/${STORAGE_ZONE_NAME}/${FILENAME}`

  const headers = {
    AccessKey: ACCESS_KEY,
    'Content-Type': 'application/octet-stream',
  }

  const fileStream = file.stream()

  const response = await fetch(url, {
    method: 'PUT',
    headers: headers as Record<string, string>,
    body: fileStream,
    duplex: 'half',
  })

  if (response.ok) {
    return json(
      {
        success: true,
        fileName: file.name,
        fileUrl: new URL(`https://pet-lms.b-cdn.net/${file.name}`).toString(),
      },
      { status: 201 },
    )
  } else {
    const errorText = await response.text()
    return json(
      { success: false, error: errorText },
      { status: response.status },
    )
  }
}
