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

  const fileName = file.name
  const accessKey = process.env.BUNNY_STORAGE_API_KEY
  const url = `${process.env.BUNNY_FILE_UPLOAD_URL}/${fileName}`
  const headers = {
    AccessKey: accessKey,
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
        fileName: fileName,
        fileUrl: new URL(`${process.env.BUNNY_CDN_URL}/${fileName}`).toString(),
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
