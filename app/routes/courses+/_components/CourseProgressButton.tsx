import { Form } from '@remix-run/react'
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'

interface CourseProgressButtonProps {
  nextChapterId: string
  isCompleted: boolean
}

export function CourseProgressButton({
  nextChapterId,
  isCompleted,
}: CourseProgressButtonProps) {
  const Icon = isCompleted ? XCircleIcon : CheckCircle2Icon

  return (
    <Form method="post">
      <input
        type="hidden"
        name="isCompleted"
        value={(!isCompleted).toString()}
      />
      <input type="hidden" name="nextChapterId" value={nextChapterId} />
      <Button
        type="submit"
        name="action"
        value="toggle-complete"
        variant={isCompleted ? 'outline' : 'success'}
        size="sm"
        className="w-full md:w-auto"
      >
        {isCompleted ? 'Mark as incomplete' : 'Complete and continue'}
        <Icon className="ml-2 h-4 w-4" />
      </Button>
    </Form>
  )
}
