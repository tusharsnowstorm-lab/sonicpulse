'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'
import { ticketTiers } from '@/data/tickets'

const ID_TYPE_LABELS: Record<string, string> = {
  nid: 'NID',
  passport: 'Passport',
  birth_certificate: 'Birth Cert.',
}

type Ticket = {
  id: string
  full_name: string
  phone: string
  nid_number: string
  id_type?: string
  nid_file_path: string
  instagram_handle: string
  gender: string
  ticket_tier: string
  status: 'pending' | 'approved' | 'rejected'
  reference_code: string
  created_at: string
  user_email: string
}

const TIER_LABELS: Record<string, string> = Object.fromEntries(ticketTiers.map((t) => [t.id, t.label]))

const STATUS_TABS = ['pending', 'approved', 'rejected'] as const

export default function AdminClient() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [nidUrls, setNidUrls] = useState<Record<string, string>>({})

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/tickets')
    const json = await res.json()
    setTickets(json.tickets ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const getNidUrl = async (ticket: Ticket) => {
    if (nidUrls[ticket.id]) return nidUrls[ticket.id]
    const res = await fetch(`/api/admin/nid-url?path=${encodeURIComponent(ticket.nid_file_path)}`)
    const json = await res.json()
    if (json.url) {
      setNidUrls((prev) => ({ ...prev, [ticket.id]: json.url }))
      return json.url
    }
    return null
  }

  const handleTicketGender = async (ticketId: string, gender: 'male' | 'female') => {
    const res = await fetch('/api/admin/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, gender }),
    })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Update failed' }))
      alert(error ?? 'Failed to update gender')
      return
    }
    await fetchTickets()
  }

  const handleAction = async (ticketId: string, action: 'approved' | 'rejected') => {
    setActionLoading(ticketId + action)
    await fetch('/api/admin/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, status: action }),
    })
    await fetchTickets()
    setActionLoading(null)
  }

  const filtered = tickets.filter((t) => t.status === activeTab)
  const counts = {
    pending: tickets.filter((t) => t.status === 'pending').length,
    approved: tickets.filter((t) => t.status === 'approved').length,
    rejected: tickets.filter((t) => t.status === 'rejected').length,
  }

  return (
    <main className="min-h-screen" style={{ background: '#000' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1100px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5">
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.32em', fontFamily: 'var(--font-montserrat)', color: '#fff' }}>SONIC PULSE</span>
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(226,75,74,0.15)', border: '1px solid rgba(226,75,74,0.3)', color: '#e24b4a', fontFamily: 'var(--font-montserrat)' }}>
              ADMIN
            </span>
          </div>
          <Link href="/dashboard" className="text-xs px-3 py-1.5 rounded-full" style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid var(--border-strong)' }}>
            My dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff', fontFamily: 'var(--font-montserrat)' }}>Ticket reviews</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Review and approve or reject submitted tickets.</p>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer"
              style={{
                background: activeTab === tab ? (tab === 'approved' ? 'rgba(34,197,94,0.12)' : 'rgba(255,63,194,0.12)') : 'var(--bg-elevated)',
                border: activeTab === tab ? (tab === 'approved' ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--accent-soft)') : '1px solid var(--border)',
                color: activeTab === tab ? (tab === 'approved' ? '#22c55e' : 'var(--accent-magenta)') : 'rgba(255,255,255,0.45)',
                touchAction: 'manipulation',
              }}
            >
              {tab === 'approved' ? <CheckCircle size={13} /> : <Clock size={13} />}
              {tab === 'pending' ? 'Pending' : tab === 'approved' ? 'Approved' : 'Rejected'}
              <span className="rounded-full px-1.5 py-0.5 text-xs" style={{ background: 'rgba(255,255,255,0.08)' }}>{counts[tab]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: 'var(--bg-elevated)' }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>No {activeTab} tickets.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} actionLoading={actionLoading} onAction={handleAction} onGenderUpdate={handleTicketGender} onGetNidUrl={() => getNidUrl(ticket)} cachedUrl={nidUrls[ticket.id]} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function TicketRow({
  ticket,
  actionLoading,
  onAction,
  onGenderUpdate,
  onGetNidUrl,
  cachedUrl,
}: {
  ticket: Ticket
  actionLoading: string | null
  onAction: (id: string, action: 'approved' | 'rejected') => void
  onGenderUpdate: (id: string, gender: 'male' | 'female') => void
  onGetNidUrl: () => Promise<string | null>
  cachedUrl?: string
}) {
  const [nidUrl, setNidUrl] = useState<string | null>(cachedUrl ?? null)
  const [loadingNid, setLoadingNid] = useState(false)
  const [genderLoading, setGenderLoading] = useState(false)

  const handleGender = async (g: 'male' | 'female') => {
    setGenderLoading(true)
    await onGenderUpdate(ticket.id, g)
    setGenderLoading(false)
  }

  const handleViewNid = async () => {
    if (nidUrl) { window.open(nidUrl, '_blank'); return }
    setLoadingNid(true)
    const url = await onGetNidUrl()
    if (url) { setNidUrl(url); window.open(url, '_blank') }
    setLoadingNid(false)
  }

  const tierLabel = TIER_LABELS[ticket.ticket_tier] ?? ticket.ticket_tier
  const date = new Date(ticket.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs" style={{ color: 'var(--accent-magenta)' }}>{ticket.reference_code}</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,63,194,0.08)', color: 'rgba(255,255,255,0.45)' }}>{tierLabel}</span>
        </div>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{date}</span>
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Name</p>
            <p className="text-sm font-semibold" style={{ color: '#fff' }}>{ticket.full_name}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phone</p>
            <p className="text-sm" style={{ color: '#fff' }}>{ticket.phone}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{ID_TYPE_LABELS[ticket.id_type ?? 'nid'] ?? 'ID'}</p>
            <p className="text-sm font-mono" style={{ color: '#fff' }}>{ticket.nid_number}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Gender</p>
            <div className="flex gap-1.5">
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  disabled={genderLoading}
                  onClick={() => handleGender(g)}
                  className="text-xs px-2.5 py-1 rounded cursor-pointer transition-all"
                  style={{
                    background: ticket.gender === g ? 'rgba(255,63,194,0.15)' : 'rgba(255,255,255,0.05)',
                    border: ticket.gender === g ? '1px solid rgba(255,63,194,0.5)' : '1px solid var(--border)',
                    color: ticket.gender === g ? 'var(--accent-magenta)' : 'rgba(255,255,255,0.45)',
                    fontFamily: 'var(--font-montserrat)',
                    touchAction: 'manipulation',
                  }}
                >
                  {g === 'male' ? 'M' : 'F'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Instagram</p>
            <a href={`https://instagram.com/${ticket.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1 hover:underline" style={{ color: 'var(--accent-magenta)' }}>
              @{ticket.instagram_handle}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xs mr-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Account: <span style={{ color: '#fff' }}>{ticket.user_email}</span></p>
          <button onClick={handleViewNid} disabled={loadingNid} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer" style={{ background: 'rgba(255,63,194,0.08)', border: '1px solid var(--accent-soft)', color: 'var(--accent-magenta)', touchAction: 'manipulation' }}>
            <ExternalLink size={12} />
            {loadingNid ? 'Loading…' : `View ${ID_TYPE_LABELS[ticket.id_type ?? 'nid'] ?? 'ID'}`}
          </button>
          {ticket.status === 'pending' && (
            <>
              <button onClick={() => onAction(ticket.id, 'approved')} disabled={!!actionLoading} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e', touchAction: 'manipulation' }}>
                <CheckCircle size={12} />
                {actionLoading === ticket.id + 'approved' ? 'Approving…' : 'Approve'}
              </button>
              <button onClick={() => onAction(ticket.id, 'rejected')} disabled={!!actionLoading} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold" style={{ background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)', color: '#e24b4a', touchAction: 'manipulation' }}>
                <XCircle size={12} />
                {actionLoading === ticket.id + 'rejected' ? 'Rejecting…' : 'Reject'}
              </button>
            </>
          )}
          {ticket.status !== 'pending' && (
            <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: ticket.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(226,75,74,0.1)', color: ticket.status === 'approved' ? '#22c55e' : '#e24b4a', border: ticket.status === 'approved' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(226,75,74,0.3)' }}>
              {ticket.status === 'approved' ? 'Approved' : 'Processing'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
