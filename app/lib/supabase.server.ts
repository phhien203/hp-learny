import { createClient } from '@supabase/supabase-js'

type UploadHandler = (args: {
  data: AsyncIterable<Uint8Array>
  filename?: string
  contentType: string
}) => Promise<string | null>

// I use the ! to mark the env vars as defined but you should use some
// sort of validation to make sure they are!
// This creates our Supabase client, you can do many things with it!
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_TOKEN!,
)
// This creates an utility for us to directly work with the bucket when needed
export const supabaseBucket = supabase.storage.from(
  process.env.SUPABASE_BUCKET!,
)

export const supabaseUploadHandler =
  (chapterId: string): UploadHandler =>
  async ({ data, filename, contentType }) => {
    const chunks = []
    for await (const chunk of data) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)
    // If there's no filename, it's a text field and we can return the value directly
    if (!filename) {
      const textDecoder = new TextDecoder()
      return textDecoder.decode(buffer)
    }
    // Otherwise, it's an image and we'll save it to Supabase
    const { data: image, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(chapterId, buffer, {
        upsert: true,
        contentType,
        cacheControl: '3600',
        metadata: {
          chapterId,
        },
      })
    if (error || !image) {
      // TODO Add error handling
      console.log(error)
      return null
    }
    return getVideoUrl(image.path)
  }

// Used to retrieve the image public url from Supabase
export const getVideoUrl = (path: string) => {
  return supabaseBucket.getPublicUrl(path).data.publicUrl
}
