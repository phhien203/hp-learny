import { useLocation, useNavigate, useSearchParams } from 'react-router';
import qs from 'query-string'
import { IconType } from 'react-icons'
import { cn } from '~/lib/utils'

interface CategoryItemProps {
  label: string
  value: string
  icon: IconType | null
}

export function CategoryItem({ label, value, icon: Icon }: CategoryItemProps) {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const currentCategoryId = searchParams.get('categoryId') as string
  const currentTitle = searchParams.get('q') as string

  const isSelected = value === currentCategoryId

  const onClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          q: currentTitle,
          categoryId: isSelected ? undefined : value,
        },
      },
      { skipNull: true, skipEmptyString: true },
    )
    navigate(url)
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-x-1 rounded-full border border-slate-200 px-3 py-2 text-sm transition hover:border-sky-700',
        isSelected && 'border-sky-700 bg-sky-200/20 text-sky-800',
      )}
    >
      {Icon && (
        <Icon size={20} className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <div className="truncate">{label}</div>
    </button>
  )
}
