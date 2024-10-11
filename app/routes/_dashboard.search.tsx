import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Categories } from '~/components/Categories'
import { SearchInput } from '~/components/SearchInput'
import { db } from '~/lib/db.server'

export async function loader() {
  const categories = await db.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return json({ categories })
}

export default function SearchPage() {
  const { categories } = useLoaderData<typeof loader>()

  return (
    <>
      <div className="px-6 pt-6 md:mb-0 md:mt-6 md:hidden">
        <SearchInput />
      </div>
      <div className="p-6">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Categories items={categories as any[]} />
      </div>
    </>
  )
}
