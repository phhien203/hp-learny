import { getAuth } from '@clerk/remix/ssr.server'
import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getAnalytics } from '~/lib/get-analytics'
import { DataCard } from './_components/DataCard'
import { Chart, ChartProps } from './_components/Chart'

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/sign-in')
  }

  const { data, totalRevenue, totalSales } = await getAnalytics(userId)

  return json({
    data,
    totalRevenue,
    totalSales,
  })
}

export default function TeacherAnalyticsPage() {
  const { data, totalRevenue, totalSales } = useLoaderData<typeof loader>()

  return (
    <div className="p-6">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <DataCard value={totalSales} label="Total Sales" />
        <DataCard value={totalRevenue} label="Total Revenue" shouldFormat />
      </div>

      <Chart data={data as unknown as ChartProps['data']} />
    </div>
  )
}
