import { useCallback, useEffect, useRef } from 'react'
import { useQuill } from 'react-quilljs'

export default function Quill({
  name,
  defaultValue,
}: {
  name: string
  defaultValue: string
}) {
  const { quill, quillRef } = useQuill({
    readOnly: false,
    modules: { toolbar: true },
  })
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleChange = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = quill?.root.innerHTML ?? ''
    }
  }, [quill, inputRef])

  useEffect(() => {
    if (quill) {
      if (defaultValue) {
        quill.clipboard.dangerouslyPasteHTML(defaultValue)
      }
      quill.on('text-change', handleChange)
    }
    return () => {
      if (quill) {
        quill.off('text-change', handleChange)
      }
    }
  }, [quill, defaultValue, handleChange])

  return (
    <div style={{ maxWidth: '700px' }}>
      <input ref={inputRef} type="hidden" name={name} />
      <div ref={quillRef} style={{ height: '300px', overflowY: 'auto' }} />
    </div>
  )
}
