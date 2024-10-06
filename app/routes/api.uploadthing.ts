import {
  createRouteHandler,
  createUploadthing,
  type FileRouter,
} from 'uploadthing/remix'
import { UploadThingError } from 'uploadthing/server'
import { getAuth } from '@clerk/remix/ssr.server'
import type { ActionFunctionArgs } from '@remix-run/node'

const f = createUploadthing()

const handleAuth = async (args: ActionFunctionArgs) => {
  const { userId } = await getAuth(args)

  if (!userId) throw new UploadThingError('Unauthorized')

  return { userId }
}

// FileRouter for your app, can contain multiple FileRoutes
export const fileRouter = {
  courseImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(({ event }) => {
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return handleAuth(event)
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('file url', file.url)
      // !!! Whatever is returned here is sent to the client side `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId }
    }),
  courseAttachment: f(['text', 'image', 'video', 'audio', 'pdf'])
    .middleware(({ event }) => {
      return handleAuth(event)
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('file url', file.url)
      // !!! Whatever is returned here is sent to the client side `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId }
    }),
  chapterVideo: f({ video: { maxFileCount: 1, maxFileSize: '512GB' } })
    .middleware(({ event }) => {
      return handleAuth(event)
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('file url', file.url)
      // !!! Whatever is returned here is sent to the client side `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type UploadRouter = typeof fileRouter

export const { action, loader } = createRouteHandler({
  router: fileRouter,
  // Apply an (optional) custom config:
  // config: { ... },
})
