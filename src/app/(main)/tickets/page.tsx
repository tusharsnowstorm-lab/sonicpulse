import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase-server'
import TicketsGate from './TicketsGate'

export const metadata = { title: 'Get Tickets — Sonic Pulse' }

export default async function TicketsPage() {
  const user = await getUser()
  if (user) redirect('/dashboard')
  return <TicketsGate />
}
