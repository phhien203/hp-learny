import { useLocation, useNavigate, useSearchParams } from '@remix-run/react'
import { SearchIcon } from 'lucide-react'
import qs from 'query-string'
import { useEffect, useState } from 'react'
import { Input } from '~/components/ui/input'
import { useDebounce } from '~/hooks/use-debounce'

export function SearchInput() {
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, 350)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const currentCategoryId = searchParams.get('categoryId')

  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          categoryId: currentCategoryId,
          q: debouncedValue,
        },
      },
      { skipEmptyString: true, skipNull: true },
    )

    navigate(url)
  }, [debouncedValue, currentCategoryId, pathname, navigate])

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-3 size-4 text-slate-600" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-full bg-slate-100 pl-9 focus-visible:ring-slate-200 md:w-[300px]"
        placeholder="Search for a course"
      />
    </div>
  )
}
