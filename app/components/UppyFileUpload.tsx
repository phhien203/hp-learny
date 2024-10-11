import { Uppy } from '@uppy/core'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import { Dashboard } from '@uppy/react'
import XHRUpload from '@uppy/xhr-upload'
import React from 'react'

interface UppyFileUploadProps {
  onChange: ({
    fileUrl,
    fileName,
  }: {
    fileUrl: string
    fileName: string
  }) => void
}

export function UppyFileUpload({ onChange }: UppyFileUploadProps) {
  const [uppy] = React.useState(() =>
    new Uppy({
      debug: true,
      restrictions: {
        allowedFileTypes: ['image/*', 'application/pdf'],
      },
    }).use(XHRUpload, {
      endpoint: '/api/upload',
    }),
  )

  uppy.on('upload-success', (file, response) => {
    console.log('upload-success', file, response)
    onChange({
      fileUrl: response.body?.fileUrl ?? '',
      fileName: response.body?.fileName ?? '',
    })
  })

  return (
    <div>
      <Dashboard uppy={uppy} />
    </div>
  )
}
