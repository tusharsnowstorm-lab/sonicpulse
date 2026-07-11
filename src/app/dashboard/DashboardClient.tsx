'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, LogOut, X } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import TicketCard from '@/components/dashboard/TicketCard'
import AddTicketForm from '@/components/dashboard/AddTicketForm'
import AccommodationSection from '@/components/dashboard/AccommodationSection'
import ProfileSection from '@/components/dashboard/ProfileSection'
import PillButton from '@/components/ui/PillButton'
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
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null)
  const supabase = createSupabaseBrowserClient()

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tickets')
      const json = await res.json()
      setTickets(json.tickets ?? [])
    } catch {
      // Network error — leave existing tickets visible
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then(({ profile }) => {
        if (profile?.profile_picture_path) {
          setProfilePicUrl(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${profile.profile_picture_path}`
          )
        }
      })
      .catch(() => {})
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleTicketAdded = () => {
    setShowForm(false)
    fetchTickets()
  }

  return (
    <main className="min-h-screen" style={{ background: '#000' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(16px)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-[1000px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.32em', fontFamily: 'var(--font-montserrat)', color: '#fff' }}
            >
              SONIC PULSE
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {(profilePicUrl || user.user_metadata?.avatar_url) && (
                <img
                  src={profilePicUrl ?? user.user_metadata.avatar_url}
                  alt={user.user_metadata?.full_name ?? 'User'}
                  width={28}
                  height={28}
                  className="rounded-full object-cover shrink-0"
                  style={{ width: 28, height: 28, border: '1.5px solid rgba(255,255,255,0.2)' }}
                />
              )}
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {user.user_metadata?.full_name ?? user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid var(--border-strong)', fontFamily: 'var(--font-montserrat)', touchAction: 'manipulation' }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Site nav strip */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[1000px] mx-auto px-4 h-10 flex items-center gap-6 overflow-x-auto">
          {[
            { href: '/', label: 'Home' },
            { href: '/lineup', label: 'Lineup' },
            { href: '/schedule', label: 'Schedule' },
            { href: '/tickets', label: 'Tickets' },
            { href: '/faq', label: 'FAQ' },
            { href: '/contact', label: 'Contact' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs whitespace-nowrap transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-montserrat)', letterSpacing: '0.1em' }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

<div className="max-w-[1000px] mx-auto px-4 py-10 space-y-14">
        {/* Tickets section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: '#fff', fontFamily: 'var(--font-montserrat)' }}
              >
                My tickets
              </h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {tickets.length === 0
                  ? 'No tickets yet. Add your first one below.'
                  : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} registered`}
              </p>
            </div>
            <PillButton onClick={() => setShowForm((v) => !v)} variant={showForm ? 'outline' : 'primary'} style={{ padding: '10px 20px', fontSize: 13 }}>
              {showForm ? <><X size={14} className="inline mr-1" />Cancel</> : <><Plus size={14} className="inline mr-1" />Add ticket</>}
            </PillButton>
          </div>

          {/* Add ticket form */}
          {showForm && (
            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <h3 className="font-bold mb-4" style={{ color: '#fff', fontFamily: 'var(--font-montserrat)' }}>
                Add a ticket
              </h3>
              <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
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
                  className="rounded-2xl h-28 animate-pulse"
                  style={{ background: 'var(--bg-elevated)' }}
                />
              ))}
            </div>
          ) : tickets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tickets.map((t) => <TicketCard key={t.id} ticket={t} onRefresh={fetchTickets} profilePicUrl={profilePicUrl ?? undefined} />)}
            </div>
          ) : !showForm ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}
            >
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Click &quot;Add ticket&quot; to register yourself or someone else.
              </p>
            </div>
          ) : null}
        </section>

        {/* Divider */}
        <hr style={{ borderColor: 'var(--border)' }} />

        {/* My Information */}
        <ProfileSection />

        {/* Divider */}
        <hr style={{ borderColor: 'var(--border)' }} />

        {/* Accommodation */}
        <AccommodationSection />
      </div>
    </main>
  )
}
