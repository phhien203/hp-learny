import { getAuth } from '@clerk/react-router/server'
import { ActionFunctionArgs, data } from 'react-router';

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return data({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await args.request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return data({ error: 'No file uploaded' }, { status: 400 })
  }

  const fileName = file.name
  const accessKey = process.env.BUNNY_STORAGE_API_KEY
  const url = `${process.env.BUNNY_FILE_UPLOAD_URL}/${fileName}`
  const headers = {
    AccessKey: accessKey,
    'Content-Type': 'application/octet-stream',
  }
  const fileStream = file.stream()

  const uploadRequest: RequestInit & { duplex: 'half' } = {
    method: 'PUT',
    headers: headers as Record<string, string>,
    body: fileStream,
    duplex: 'half',
  }
  const response = await fetch(url, uploadRequest)

  if (response.ok) {
    return data(
      {
        success: true,
        fileName: fileName,
        fileUrl: new URL(`${process.env.BUNNY_CDN_URL}/${fileName}`).toString(),
      },
      { status: 201 },
    )
  } else {
    const errorText = await response.text()
    return data(
      { success: false, error: errorText },
      { status: response.status },
    )
  }
}
