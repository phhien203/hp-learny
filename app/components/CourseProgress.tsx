import { cn } from '~/lib/utils'
import { Progress } from './ui/progress'

interface CourseProgressProps {
  variant: 'success' | 'default'
  value: number
  size?: 'default' | 'sm'
}

const colorVariant = {
  default: 'text-sky-700',
  success: 'text-emerald-700',
}

const sizeVariant = {
  default: 'text-sm',
  sm: 'text-xs',
}

export function CourseProgress({ variant, value, size }: CourseProgressProps) {
  return (
    <div>
      <Progress className="h-2" value={value} variant={variant} />

      <p
        className={cn(
          'mt-2 font-medium text-sky-700',
          colorVariant[variant || 'default'],
          sizeVariant[size || 'default'],
        )}
      >
        {Math.round(value)}% Complete
      </p>
    </div>
  )
}
