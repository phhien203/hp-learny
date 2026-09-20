import { getAuth } from '@clerk/react-router/server'
import { data, LoaderFunctionArgs, redirect, useLoaderData } from 'react-router'
import { getAnalytics } from '~/lib/get-analytics'
import { DataCard } from './components/DataCard'
import { Chart, ChartProps } from './components/Chart'

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect('/sign-in')
  }

  const { data: chartData, totalRevenue, totalSales } = await getAnalytics(userId)

  return data({
    data: chartData,
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
