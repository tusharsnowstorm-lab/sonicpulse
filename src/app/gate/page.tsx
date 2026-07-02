import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase-server'
import { isGateStaff } from '@/lib/gate-auth'
import GateLanding from './GateLanding'

export const metadata = { title: 'Gate — Sonic Pulse' }

export default async function GatePage() {
  const user = await getUser()
  if (!user) redirect('/login')
  if (!isGateStaff(user.email)) redirect('/')

  return <GateLanding email={user.email!} />
}
