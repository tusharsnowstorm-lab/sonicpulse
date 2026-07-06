'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'

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

const TIER_LABELS: Record<string, string> = {
  phase1: 'Phase 1 — Early Bird',
  phase2: 'Phase 2',
  phase3: 'Phase 3 — Last Release',
}

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
    <main className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b" style={{ background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1100px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/images/logo-badge.webp" alt="Sonic Pulse" width={30} height={30} className="rounded-full" style={{ border: '1.5px solid rgba(255,255,255,0.3)' }} />
              <span className="font-black tracking-[0.15em] text-sm" style={{ fontFamily: 'var(--font-montserrat)', color: 'var(--text-primary)' }}>SONIC <span style={{ color: 'var(--accent-magenta)' }}>PULSE</span></span>
            </Link>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,45,107,0.15)', border: '1px solid rgba(255,45,107,0.3)', color: 'var(--accent-pulse)', fontFamily: 'var(--font-jetbrains-mono)' }}>
              ADMIN
            </span>
          </div>
          <Link href="/dashboard" className="text-xs px-3 py-1.5 rounded" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            My Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>Ticket Reviews</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Review and approve or reject submitted tickets.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
              style={{
                background: activeTab === tab ? (tab === 'approved' ? 'rgba(34,197,94,0.12)' : 'rgba(204,255,0,0.12)') : 'var(--bg-elevated)',
                border: activeTab === tab ? (tab === 'approved' ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(204,255,0,0.4)') : '1px solid var(--border)',
                color: activeTab === tab ? (tab === 'approved' ? '#22c55e' : 'var(--accent-volt)') : 'var(--text-muted)',
              }}
            >
              {tab === 'pending' ? <Clock size={13} /> : tab === 'approved' ? <CheckCircle size={13} /> : <Clock size={13} />}
              {tab === 'pending' ? 'Pending' : tab === 'approved' ? 'Approved' : 'Processing'}
              <span className="rounded-full px-1.5 py-0.5 text-xs" style={{ background: 'rgba(255,255,255,0.08)' }}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Ticket list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl h-32 animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl p-10 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No {activeTab} tickets.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ticket) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                actionLoading={actionLoading}
                onAction={handleAction}
                onGetNidUrl={() => getNidUrl(ticket)}
                cachedUrl={nidUrls[ticket.id]}
              />
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
  onGetNidUrl,
  cachedUrl,
}: {
  ticket: Ticket
  actionLoading: string | null
  onAction: (id: string, action: 'approved' | 'rejected') => void
  onGetNidUrl: () => Promise<string | null>
  cachedUrl?: string
}) {
  const [nidUrl, setNidUrl] = useState<string | null>(cachedUrl ?? null)
  const [loadingNid, setLoadingNid] = useState(false)

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
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs" style={{ color: 'var(--accent-electric)' }}>{ticket.reference_code}</span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,240,255,0.08)', color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>
            {tierLabel}
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{date}</span>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Name</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ticket.full_name}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phone</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{ticket.phone}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {ID_TYPE_LABELS[ticket.id_type ?? 'nid'] ?? 'ID'}
            </p>
            <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{ticket.nid_number}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Gender</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{ticket.gender ? ticket.gender.charAt(0).toUpperCase() + ticket.gender.slice(1) : '—'}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Instagram</p>
            <a
              href={`https://instagram.com/${ticket.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm flex items-center gap-1 hover:underline"
              style={{ color: 'var(--accent-electric)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              @{ticket.instagram_handle}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xs mr-2" style={{ color: 'var(--text-muted)' }}>
            Account: <span style={{ color: 'var(--text-primary)' }}>{ticket.user_email}</span>
          </p>

          {/* View NID */}
          <button
            onClick={handleViewNid}
            disabled={loadingNid}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer transition-colors"
            style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.25)', color: 'var(--accent-electric)' }}
          >
            <ExternalLink size={12} />
            {loadingNid ? 'Loading…' : `View ${ID_TYPE_LABELS[ticket.id_type ?? 'nid'] ?? 'ID'}`}
          </button>

          {/* Approve / Reject — only show on pending */}
          {ticket.status === 'pending' && (
            <>
              <button
                onClick={() => onAction(ticket.id, 'approved')}
                disabled={!!actionLoading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer transition-colors font-semibold"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e' }}
              >
                <CheckCircle size={12} />
                {actionLoading === ticket.id + 'approved' ? 'Approving…' : 'Approve'}
              </button>
              <button
                onClick={() => onAction(ticket.id, 'rejected')}
                disabled={!!actionLoading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer transition-colors font-semibold"
                style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.3)', color: 'var(--accent-pulse)' }}
              >
                <XCircle size={12} />
                {actionLoading === ticket.id + 'rejected' ? 'Rejecting…' : 'Reject'}
              </button>
            </>
          )}

          {ticket.status !== 'pending' && (
            <span
              className="text-xs px-2 py-1 rounded font-semibold"
              style={{
                background: ticket.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(255,45,107,0.1)',
                color: ticket.status === 'approved' ? '#22c55e' : 'var(--accent-pulse)',
                border: ticket.status === 'approved' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,45,107,0.3)',
              }}
            >
              {ticket.status === 'approved' ? '✓ Approved' : '⟳ Processing'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
