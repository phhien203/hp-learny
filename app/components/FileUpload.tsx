import { toast } from 'react-hot-toast'
import { ClientUploadedFileData } from 'uploadthing/types'
import { UploadDropzone } from '~/lib/uploadthing'
import { UploadRouter } from '~/routes/api.uploadthing'

type FileUploadProps = {
  onChange: (res?: ClientUploadedFileData<{ uploadedBy: string }>) => void
  endpoint: keyof UploadRouter
}

export function FileUpload({ onChange, endpoint }: FileUploadProps) {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0])
      }}
      onUploadError={(error: Error) => {
        toast.error(`${error?.message}`)
      }}
    />
  )
}
