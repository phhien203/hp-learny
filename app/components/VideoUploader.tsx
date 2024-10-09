import { useFetcher } from '@remix-run/react'
import { Button } from './ui/button'

const VideoUploader = () => {
  const fetcher = useFetcher()

  return (
    <>
      <fetcher.Form encType="multipart/form-data" method="post">
        <input name="video" type="file" />
        <Button type="submit">Upload Video</Button>
      </fetcher.Form>
    </>
  )
}

export { VideoUploader }
