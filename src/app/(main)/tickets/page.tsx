import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase-server'
import { TICKETS_LIVE } from '@/data/tickets'
import PageHeader from '@/components/ui/PageHeader'
import { PillLink } from '@/components/ui/PillButton'
import TicketsGate from './TicketsGate'

export const metadata = { title: 'Get Tickets — Sonic Pulse' }

export default async function TicketsPage() {
  if (!TICKETS_LIVE) {
    return (
      <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
        <PageHeader
          eyebrow="25 September 2026"
          title="Tickets open soon"
          sub="Prices and registration go live shortly. Follow @sonicpulsefestival for the announcement."
        />
        <div className="flex flex-col sm:flex-row items-start gap-4" style={{ marginTop: 8 }}>
          <PillLink href="/lineup" variant="primary">See the lineup</PillLink>
          <PillLink href="/activities" variant="ghost">Explore the grounds →</PillLink>
        </div>
      </div>
    )
  }

  const user = await getUser()
  if (user) redirect('/dashboard')
  return <TicketsGate />
}
