import { Button } from '~/components/ui/button'
import { formatPrice } from '~/lib/format'

export function CourseEnrollButton({
  courseId,
  price,
}: {
  courseId: string
  price: number
}) {
  return (
    <Button className="w-full md:w-auto" size="sm">
      Enroll for {formatPrice(price)}
    </Button>
  )
}
