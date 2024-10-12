// import { useEffect } from 'react'
// import { useQuill } from 'react-quilljs'

// export default function Preview({ defaultValue }: { defaultValue: string }) {
//   const { quill, quillRef } = useQuill({
//     readOnly: true,
//     modules: { toolbar: false },
//   })
//   useEffect(() => {
//     if (quill) {
//       if (defaultValue) {
//         quill.clipboard.dangerouslyPasteHTML(defaultValue)
//       }
//     }
//   }, [quill, defaultValue])

//   return (
//     <div style={{ maxWidth: '700px' }}>
//       <div ref={quillRef} style={{}} />
//     </div>
//   )
// }
