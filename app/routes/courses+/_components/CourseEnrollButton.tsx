import { useFetcher } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { formatPrice } from '~/lib/format'

export function CourseEnrollButton({
  courseId,
  price,
}: {
  courseId: string
  price: number
}) {
  const enrollCourse = useFetcher<{ url: string | null }>()

  if (enrollCourse.state === 'idle' && enrollCourse.data?.url) {
    window.location.href = enrollCourse.data.url
  }

  return (
    <Button
      className="w-full md:w-auto"
      size="sm"
      disabled={enrollCourse.state !== 'idle'}
      onClick={() =>
        enrollCourse.submit(
          {},
          {
            method: 'post',
            action: `/api/courses/${courseId}/checkout`,
          },
        )
      }
    >
      Enroll for {formatPrice(price)}
    </Button>
  )
}
