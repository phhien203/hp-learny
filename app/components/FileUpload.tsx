import { toast } from 'react-hot-toast'
import { UploadDropzone } from '~/lib/uploadthing'
import { UploadRouter } from '~/routes/api.uploadthing'

type FileUploadProps = {
  onChange: (url?: string) => void
  endpoint: keyof UploadRouter
}

export function FileUpload({ onChange, endpoint }: FileUploadProps) {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0]?.url)
      }}
      onUploadError={(error: Error) => {
        toast.error(`${error?.message}`)
      }}
    />
  )
}
