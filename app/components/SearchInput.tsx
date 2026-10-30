import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { SearchIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Input } from '~/components/ui/input'

export function SearchInput() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [value, setValue] = useState(query)
  const pendingSearch = useRef<number>()
  const submittedSearch = useRef<string>()
  const navigate = useNavigate()
  const { pathname, search, key } = useLocation()

  useEffect(() => {
    const isSearchCommit = submittedSearch.current === `${pathname}${search}`
    submittedSearch.current = undefined
    if (!isSearchCommit) {
      clearTimeout(pendingSearch.current)
      setValue(query)
    }
  }, [query, pathname, search, key])

  useEffect(() => () => clearTimeout(pendingSearch.current), [])

  function updateSearch(nextValue: string) {
    setValue(nextValue)
    clearTimeout(pendingSearch.current)
    pendingSearch.current = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (nextValue) {
        params.set('q', nextValue)
      } else {
        params.delete('q')
      }
      const nextSearch = params.toString()
      const url = nextSearch ? `${pathname}?${nextSearch}` : pathname
      // A completed search must not replace edits made while its loader ran.
      submittedSearch.current = url
      navigate(url)
    }, 350)
  }

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-3 size-4 text-slate-600" />
      <Input
        value={value}
        onChange={(event) => updateSearch(event.target.value)}
        className="w-full rounded-full bg-slate-100 pl-9 focus-visible:ring-slate-200 md:w-[300px]"
        placeholder="Search for a course"
        aria-label="Search for a course"
      />
    </div>
  )
}
