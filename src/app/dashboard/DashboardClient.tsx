'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, LogOut, X } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import TicketCard from '@/components/dashboard/TicketCard'
import AddTicketForm from '@/components/dashboard/AddTicketForm'
import AccommodationSection from '@/components/dashboard/AccommodationSection'
import Button from '@/components/ui/Button'
import type { User } from '@supabase/supabase-js'

type Ticket = {
  id: string
  full_name: string
  phone: string
  nid_number: string
  ticket_tier: string
  status: 'pending' | 'approved' | 'rejected'
  reference_code: string
  created_at: string
}

export default function DashboardClient({ user }: { user: User }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const supabase = createSupabaseBrowserClient()

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/tickets')
    const json = await res.json()
    setTickets(json.tickets ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleTicketAdded = () => {
    setShowForm(false)
    fetchTickets()
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{
          background: 'rgba(5,5,8,0.92)',
          backdropFilter: 'blur(16px)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-[1000px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo-badge.webp"
              alt="Sonic Pulse"
              width={32}
              height={32}
              className="rounded-full"
              style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}
            />
            <span
              className="font-black tracking-[0.15em] text-base"
              style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--accent-electric)' }}
            >
              SONIC PULSE
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {user.user_metadata?.avatar_url && (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.full_name ?? 'User'}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              )}
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {user.user_metadata?.full_name ?? user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 py-10 space-y-14">
        {/* Tickets section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}
              >
                My Tickets
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {tickets.length === 0
                  ? 'No tickets yet. Add your first one below.'
                  : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} registered`}
              </p>
            </div>
            <Button onClick={() => setShowForm((v) => !v)} size="sm">
              {showForm ? <><X size={14} className="inline mr-1" />Cancel</> : <><Plus size={14} className="inline mr-1" />Add ticket</>}
            </Button>
          </div>

          {/* Add ticket form */}
          {showForm && (
            <div
              className="rounded-lg p-6 mb-6"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>
                Add a ticket
              </h3>
              <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                Each ticket requires the attendee&apos;s details and NID for verification. You can register tickets for others.
              </p>
              <AddTicketForm onSuccess={handleTicketAdded} />
            </div>
          )}

          {/* Ticket list */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-lg h-28 animate-pulse"
                  style={{ background: 'var(--bg-elevated)' }}
                />
              ))}
            </div>
          ) : tickets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tickets.map((t) => <TicketCard key={t.id} ticket={t} />)}
            </div>
          ) : !showForm ? (
            <div
              className="rounded-lg p-8 text-center"
              style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Click &quot;Add ticket&quot; to register yourself or someone else.
              </p>
            </div>
          ) : null}
        </section>

        {/* Divider */}
        <hr style={{ borderColor: 'var(--border)' }} />

        {/* Accommodation */}
        <AccommodationSection />
      </div>
    </main>
  )
}
