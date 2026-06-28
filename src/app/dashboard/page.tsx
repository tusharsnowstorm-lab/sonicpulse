import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase-server'
import DashboardClient from './DashboardClient'

export const metadata = { title: 'My Dashboard — Sonic Pulse' }

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  return <DashboardClient user={user} />
}
