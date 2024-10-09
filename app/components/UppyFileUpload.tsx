import React from 'react'
import { Uppy } from '@uppy/core'
import { Dashboard, useUppyState } from '@uppy/react'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'

export function UppyFileUpload() {
  const [uppy] = React.useState(() => new Uppy({ debug: true }))
  const totalProgress = useUppyState(uppy, (state) => state.totalProgress)

  return (
    <div>
      <Dashboard uppy={uppy} />
      <div>{totalProgress}</div>
    </div>
  )
}
