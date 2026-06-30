import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase-server'
import AdminClient from './AdminClient'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase())

export default async function AdminPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) redirect('/')
  return <AdminClient />
}
