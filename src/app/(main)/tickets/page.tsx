import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase-server'
import { TICKETS_LIVE, AFTERHOURS_TICKETS_LIVE, AFTERHOURS_REGISTER_URL } from '@/data/tickets'
import PageHeader from '@/components/ui/PageHeader'
import { PillLink } from '@/components/ui/PillButton'
import AppPromoBand from '@/components/ui/AppPromoBand'
import TicketsGate from './TicketsGate'

export const metadata = { title: 'Get Tickets — Sonic Pulse' }

export default async function TicketsPage() {
  if (AFTERHOURS_TICKETS_LIVE) {
    return (
      <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
        <PageHeader
          eyebrow="25 September 2026"
          title="Register for tickets on Afterhours"
          sub="One form at onlyafterhours.com, checked usually the same day — then pay and your ticket lives there. The Afterhours app is on the way."
        />
        <div className="flex flex-col sm:flex-row items-start gap-4" style={{ marginTop: 8 }}>
          <PillLink href={AFTERHOURS_REGISTER_URL} variant="primary">Register on Afterhours →</PillLink>
          <PillLink href="/lineup" variant="ghost">See the lineup</PillLink>
        </div>
        <div
          className="text-sm text-left"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: 16, marginTop: 40, maxWidth: 640 }}
        >
          <strong style={{ color: '#fff' }}>How it works: </strong>
          Sign in with Google, Apple, or an email code at onlyafterhours.com → one form: photo, name, phone, Instagram, ID → we check it, usually the same day → pay by card or mobile banking. One ticket per person, and the name must match the ID you bring.
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-label-muted)', marginTop: 14, maxWidth: 640 }}>
          Your Sonic Pulse website account doesn&apos;t carry over — sign up fresh at onlyafterhours.com (same email is fine). Trouble signing in or paying? support@onlyafterhours.com.
        </p>
        <div style={{ marginTop: 56 }}>
          <AppPromoBand />
        </div>
      </div>
    )
  }

  if (!TICKETS_LIVE) {
    return (
      <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
        <PageHeader
          eyebrow="25 September 2026"
          title="Tickets open soon"
          sub="Ticket announcements land on @sonicpulsefestival first."
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
