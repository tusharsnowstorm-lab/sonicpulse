import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase-server'
import { GUEST_ACCOUNTS_LIVE } from '@/data/auth'
import DashboardClient from './DashboardClient'

export const metadata = { title: 'My Dashboard — Sonic Pulse' }

export default async function DashboardPage() {
  if (!GUEST_ACCOUNTS_LIVE) redirect('/')
  const user = await getUser()
  if (!user) redirect('/login')
  return <DashboardClient user={user} />
}
