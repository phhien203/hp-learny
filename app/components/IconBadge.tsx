import { cva, type VariantProps } from 'class-variance-authority'
import { LucideIcon } from 'lucide-react'
import { cn } from '~/lib/utils'

const backgroundVariants = cva(
  'rounded-full flex items-center justify-center size-8',
  {
    variants: {
      variant: {
        default: 'bg-sky-100',
        success: 'bg-emerald-100',
      },
      size: {
        default: 'p-2',
        sm: 'p-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const iconVariants = cva('', {
  variants: {
    variant: {
      default: 'text-sky-700',
      success: 'text-emerald-700',
    },
    size: {
      default: 'size-6',
      sm: 'size-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export function IconBadge({
  icon: Icon,
  variant,
  size,
}: {
  icon: LucideIcon
  variant?: VariantProps<typeof backgroundVariants>['variant']
  size?: VariantProps<typeof backgroundVariants>['size']
}) {
  return (
    <div className={cn(backgroundVariants({ variant, size }))}>
      <Icon className={cn(iconVariants({ variant, size }))} />
    </div>
  )
}
