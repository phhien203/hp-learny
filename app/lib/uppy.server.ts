import { Uppy } from '@uppy/core'
import Tus from '@uppy/tus'

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsY3J2eHZkaGJheHVxdnV0bHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzOTM2NDYsImV4cCI6MjA0Mzk2OTY0Nn0.fvZPkWO6MmwTD9yzYXwQ5loWhqTubdP3DOrkQW_PLWo'
const projectId = 'xlcrvxvdhbaxuqvutlrz'
const bucketName = 'pet-lms'
const folderName = ''
const supabaseUploadURL = `https://${projectId}.supabase.co/storage/v1/upload/resumable`

export const uppy = new Uppy({
  debug: true,
  onBeforeFileAdded: (currentFile) => {
    console.log('currentFile', currentFile)
    const modifiedFile = {
      ...currentFile,
      name: `${Date.now()}__${currentFile.name}`,
    }
    console.log('modifiedFile', modifiedFile)
    return modifiedFile
  },
}).use(Tus, {
  endpoint: supabaseUploadURL,
  headers: {
    authorization: `Bearer ${token}`,
  },
  chunkSize: 6 * 1024 * 1024,
  allowedMetaFields: [
    'bucketName',
    'objectName',
    'contentType',
    'cacheControl',
  ],
})

uppy.on('file-added', (file) => {
  file.meta = {
    ...file.meta,
    bucketName: bucketName,
    objectName: folderName ? `${folderName}/${file.name}` : file.name,
    contentType: file.type,
  }
})
