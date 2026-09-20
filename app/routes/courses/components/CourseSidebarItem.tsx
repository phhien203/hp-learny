import { useLocation, useNavigate } from 'react-router';
import { CheckCircleIcon, LockIcon, PlayCircleIcon } from 'lucide-react'
import { cn } from '~/lib/utils'

export function CourseSidebarItem({
  id,
  label,
  isCompleted,
  courseId,
  isLocked,
}: {
  id: string
  label: string
  isCompleted: boolean
  courseId: string
  isLocked: boolean
}) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const Icon = isLocked
    ? LockIcon
    : isCompleted
      ? CheckCircleIcon
      : PlayCircleIcon

  const isActive = pathname?.includes(`${id}`)

  const onClick = () => {
    navigate(`/courses/${courseId}/chapters/${id}`)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-x-2 pl-3 text-sm font-medium text-slate-500 transition-all hover:bg-slate-300/50 hover:text-slate-600',
        isActive &&
          'bg-slate-200/20 text-slate-700 hover:bg-slate-200/20 hover:text-slate-700',
        isCompleted && 'text-emerald-700 hover:text-emerald-700',
        isCompleted && isActive && 'bg-emerald-200/20',
      )}
    >
      <div className="flex items-center space-x-1 py-4">
        <Icon
          size={22}
          className={cn(
            'flex-shrink-0 text-slate-500',
            isActive && 'text-slate-700',
            isCompleted && 'text-emerald-700',
          )}
        />
        <p className="line-clamp-1 text-ellipsis" title={label}>
          {label}
        </p>
      </div>

      <div
        className={cn(
          'ml-auto h-full border-2 border-slate-700 opacity-0 transition-all',
          isActive && 'opacity-100',
          isCompleted && 'border-emerald-700',
        )}
      ></div>
    </button>
  )
}
