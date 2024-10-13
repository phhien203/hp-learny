import { useFetcher } from '@remix-run/react'
import { Trash2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ConfirmModal } from '~/components/ConfirmModal'
import { Button } from '~/components/ui/button'

interface ChapterActionsProps {
  disabled: boolean
  courseId: string
  chapterId: string
  isPublished: boolean
}

export function ChapterActions({
  disabled,
  courseId,
  chapterId,
  isPublished,
}: ChapterActionsProps) {
  const publishChapter = useFetcher({ key: 'publishChapter' })
  const unpublishChapter = useFetcher({ key: 'unpublishChapter' })
  const deleteChapter = useFetcher({ key: 'deleteChapter' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (publishChapter.state === 'idle' && publishChapter.data) {
      setIsLoading(false)
    }
  }, [publishChapter.state, publishChapter.data])

  useEffect(() => {
    if (unpublishChapter.state === 'idle' && unpublishChapter.data) {
      setIsLoading(false)
    }
  }, [unpublishChapter.state, unpublishChapter.data])

  useEffect(() => {
    if (deleteChapter.state === 'idle' && deleteChapter.data) {
      setIsLoading(false)
    }
  }, [deleteChapter.state, deleteChapter.data])

  const onTogglePublish = async () => {
    setIsLoading(true)

    if (isPublished) {
      unpublishChapter.submit(
        {},
        {
          method: 'POST',
          action: `/api/courses/${courseId}/chapters/${chapterId}/unpublish`,
        },
      )
    } else {
      publishChapter.submit(
        {},
        {
          method: 'POST',
          action: `/api/courses/${courseId}/chapters/${chapterId}/publish`,
        },
      )
    }
  }

  const onDelete = async () => {
    setIsLoading(true)

    deleteChapter.submit(
      {},
      {
        method: 'DELETE',
        action: `/teacher/courses/${courseId}/chapters/${chapterId}`,
      },
    )
  }

  return (
    <div className="flex items-center gap-x-2">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isLoading}
        onClick={onTogglePublish}
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>

      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" variant="destructive" disabled={isLoading}>
          <Trash2Icon className="size-4" />
        </Button>
      </ConfirmModal>
    </div>
  )
}
