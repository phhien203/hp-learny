import { useFetcher } from '@remix-run/react'
import { TrashIcon } from 'lucide-react'
import { ConfirmModal } from '~/components/ConfirmModal'
import { Button } from '~/components/ui/button'

interface CourseActionProps {
  disabled: boolean
  courseId: string
  isPublished: boolean
}

export function CourseAction({
  disabled,
  courseId,
  isPublished,
}: CourseActionProps) {
  const publishCourse = useFetcher({ key: 'publishCourse' })
  const unpublishCourse = useFetcher({ key: 'unpublishCourse' })
  const deleteCourse = useFetcher({ key: 'deleteCourse' })

  const onTogglePublish = () => {
    if (isPublished) {
      unpublishCourse.submit(
        {},
        {
          method: 'POST',
          action: `/api/courses/${courseId}/unpublish`,
        },
      )
    } else {
      publishCourse.submit(
        {},
        {
          method: 'POST',
          action: `/api/courses/${courseId}/publish`,
        },
      )
    }
  }

  return (
    <div className="flex items-center gap-x-2">
      <Button
        size="sm"
        variant="outline"
        disabled={
          disabled ||
          deleteCourse.state !== 'idle' ||
          publishCourse.state !== 'idle' ||
          unpublishCourse.state !== 'idle'
        }
        onClick={onTogglePublish}
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>

      <ConfirmModal
        onConfirm={() => {
          deleteCourse.submit(
            {},
            {
              method: 'DELETE',
              action: `/teacher/courses/${courseId}`,
            },
          )
        }}
      >
        <Button
          size="sm"
          disabled={
            deleteCourse.state !== 'idle' ||
            publishCourse.state !== 'idle' ||
            unpublishCourse.state !== 'idle'
          }
        >
          <TrashIcon className="size-4" />
        </Button>
      </ConfirmModal>
    </div>
  )
}
