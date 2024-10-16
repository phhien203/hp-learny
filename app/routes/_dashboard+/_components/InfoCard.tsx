import { LucideIcon } from 'lucide-react'
import { IconBadge } from '~/components/IconBadge'

export function InfoCard({
  icon: Icon,
  label,
  numberOfItems,
  variant,
}: {
  icon: LucideIcon
  label: string
  numberOfItems: number
  variant?: 'default' | 'success'
}) {
  return (
    <div className="flex items-center gap-x-2 rounded-md border p-3">
      <IconBadge icon={Icon} variant={variant} size="sm" />

      <div>
        <p className="font-medium">{label}</p>

        <p className="text-gray-500 text-sm">
          {numberOfItems} {numberOfItems === 1 ? 'Course' : 'Courses'}
        </p>
      </div>
    </div>
  )
}
