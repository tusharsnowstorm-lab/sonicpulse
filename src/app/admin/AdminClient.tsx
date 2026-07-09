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

// Legacy keys (5k_20k/20k_100k/100k_plus) stay forever — existing
// influencer_applications rows already have them and deleting the label
// would render a raw enum string for every one of those. The five new
// keys are what src/app/influencers/page.tsx's form submits going forward.
const FOLLOWER_LABELS: Record<string, string> = {
  under_1k: '< 1K',
  '1k_5k': '1K–5K',
  '5k_20k': '5K–20K',
  '20k_100k': '20K–100K',
  '100k_plus': '100K+',
  '5k_10k': '5K–10K',
  '10k_15k': '10K–15K',
  '15k_plus': '15K+',
}

const CONTENT_LABELS: Record<string, string> = {
  music_nightlife: 'Music / Nightlife',
  lifestyle: 'Lifestyle',
  fashion_beauty: 'Fashion & Beauty',
  entertainment: 'Entertainment',
  general: 'General',
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

type InfluencerApp = {
  id: string
  full_name: string
  email: string
  phone: string
  id_type: string
  id_number: string
  gender?: string
  nid_file_path?: string
  instagram_handle: string
  tiktok_handle?: string
  youtube_channel?: string
  primary_platform: string
  follower_count: string
  content_type: string
  message?: string
  status: 'pending' | 'approved' | 'rejected'
  reference_code?: string
  created_at: string
}

// App-originated "apply to promote" applications — distinct from the
// website's own influencer_applications form above. Profile fields are
// already on file (onboarding + Become an Influencer), so this is a
// review-only queue, not a form submission.
type PromotionApp = {
  id: string
  user_id: string
  event_id: string
  status: 'pending' | 'approved' | 'rejected'
  reference_code?: string
  created_at: string
  full_name: string
  phone: string
  instagram_handle: string
  primary_platform: string
  follower_count: string
  content_type: string
  already_has_ticket: boolean
}

const TIER_LABELS: Record<string, string> = {
  phase1: 'Phase 1 — Early Bird',
  phase2: 'Phase 2',
  phase3: 'Phase 3 — Last Release',
}

const STATUS_TABS = ['pending', 'approved', 'rejected'] as const

export default function AdminClient() {
  const [section, setSection] = useState<'tickets' | 'influencers' | 'promotions'>('tickets')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [influencers, setInfluencers] = useState<InfluencerApp[]>([])
  const [promotions, setPromotions] = useState<PromotionApp[]>([])
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

  const fetchInfluencers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/influencers')
    const json = await res.json()
    setInfluencers(json.applications ?? [])
    setLoading(false)
  }, [])

  const fetchPromotions = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/influencers?source=promotion')
    const json = await res.json()
    setPromotions(json.applications ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (section === 'tickets') fetchTickets()
    else if (section === 'influencers') fetchInfluencers()
    else fetchPromotions()
  }, [section, fetchTickets, fetchInfluencers, fetchPromotions])

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

  const handleInfluencerAction = async (applicationId: string, action: 'approved' | 'rejected') => {
    setActionLoading(applicationId + action)
    await fetch('/api/admin/influencers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, status: action }),
    })
    await fetchInfluencers()
    setActionLoading(null)
  }

  const handlePromotionAction = async (applicationId: string, action: 'approved' | 'rejected') => {
    setActionLoading(applicationId + action)
    await fetch('/api/admin/influencers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, status: action, source: 'promotion' }),
    })
    await fetchPromotions()
    setActionLoading(null)
  }

  const filtered = tickets.filter((t) => t.status === activeTab)
  const counts = {
    pending: tickets.filter((t) => t.status === 'pending').length,
    approved: tickets.filter((t) => t.status === 'approved').length,
    rejected: tickets.filter((t) => t.status === 'rejected').length,
  }
  const infCounts = {
    pending: influencers.filter((a) => a.status === 'pending').length,
    approved: influencers.filter((a) => a.status === 'approved').length,
    rejected: influencers.filter((a) => a.status === 'rejected').length,
  }
  const filteredInf = influencers.filter((a) => a.status === activeTab)
  const promoCounts = {
    pending: promotions.filter((a) => a.status === 'pending').length,
    approved: promotions.filter((a) => a.status === 'approved').length,
    rejected: promotions.filter((a) => a.status === 'rejected').length,
  }
  const filteredPromo = promotions.filter((a) => a.status === activeTab)

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

        {/* Section switcher */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => { setSection('tickets'); setActiveTab('pending') }}
            className="px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all"
            style={{
              background: section === 'tickets' ? 'var(--bg-elevated)' : 'transparent',
              border: section === 'tickets' ? '1px solid var(--accent-magenta)' : '1px solid var(--border)',
              color: section === 'tickets' ? 'var(--accent-magenta)' : 'var(--text-muted)',
            }}
          >
            🎫 Ticket Reviews
          </button>
          <button
            onClick={() => { setSection('influencers'); setActiveTab('pending') }}
            className="px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all"
            style={{
              background: section === 'influencers' ? 'var(--bg-elevated)' : 'transparent',
              border: section === 'influencers' ? '1px solid var(--accent-magenta)' : '1px solid var(--border)',
              color: section === 'influencers' ? 'var(--accent-magenta)' : 'var(--text-muted)',
            }}
          >
            📸 Influencers
            {infCounts.pending > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-black" style={{ background: 'var(--accent-magenta)', color: '#fff' }}>
                {infCounts.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => { setSection('promotions'); setActiveTab('pending') }}
            className="px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all"
            style={{
              background: section === 'promotions' ? 'var(--bg-elevated)' : 'transparent',
              border: section === 'promotions' ? '1px solid var(--accent-magenta)' : '1px solid var(--border)',
              color: section === 'promotions' ? 'var(--accent-magenta)' : 'var(--text-muted)',
            }}
          >
            🎤 App Applications
            {promoCounts.pending > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-black" style={{ background: 'var(--accent-magenta)', color: '#fff' }}>
                {promoCounts.pending}
              </span>
            )}
          </button>
        </div>

        {section === 'tickets' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-montserrat)' }}>Ticket Reviews</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Review and approve or reject submitted tickets.</p>
            </div>

            {/* Status tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                  style={{
                    background: activeTab === tab ? (tab === 'approved' ? 'rgba(34,197,94,0.12)' : 'rgba(255,63,194,0.12)') : 'var(--bg-elevated)',
                    border: activeTab === tab ? (tab === 'approved' ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,63,194,0.4)') : '1px solid var(--border)',
                    color: activeTab === tab ? (tab === 'approved' ? '#22c55e' : 'var(--accent-volt)') : 'var(--text-muted)',
                  }}
                >
                  {tab === 'approved' ? <CheckCircle size={13} /> : <Clock size={13} />}
                  {tab === 'pending' ? 'Pending' : tab === 'approved' ? 'Approved' : 'Processing'}
                  <span className="rounded-full px-1.5 py-0.5 text-xs" style={{ background: 'rgba(255,255,255,0.08)' }}>{counts[tab]}</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="rounded-xl h-32 animate-pulse" style={{ background: 'var(--bg-elevated)' }} />)}</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl p-10 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No {activeTab} tickets.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} actionLoading={actionLoading} onAction={handleAction} onGetNidUrl={() => getNidUrl(ticket)} cachedUrl={nidUrls[ticket.id]} />
                ))}
              </div>
            )}
          </>
        )}

        {section === 'influencers' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-montserrat)' }}>Influencer Applications</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Review and approve media/influencer pass applications.</p>
            </div>

            {/* Status tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                  style={{
                    background: activeTab === tab ? 'rgba(255,63,194,0.12)' : 'var(--bg-elevated)',
                    border: activeTab === tab ? '1px solid rgba(255,63,194,0.4)' : '1px solid var(--border)',
                    color: activeTab === tab ? 'var(--accent-magenta)' : 'var(--text-muted)',
                  }}
                >
                  {tab === 'approved' ? <CheckCircle size={13} /> : <Clock size={13} />}
                  {tab === 'pending' ? 'Pending' : tab === 'approved' ? 'Approved' : 'Rejected'}
                  <span className="rounded-full px-1.5 py-0.5 text-xs" style={{ background: 'rgba(255,255,255,0.08)' }}>{infCounts[tab]}</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="rounded-xl h-32 animate-pulse" style={{ background: 'var(--bg-elevated)' }} />)}</div>
            ) : filteredInf.length === 0 ? (
              <div className="rounded-xl p-10 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No {activeTab} influencer applications.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInf.map((app) => (
                  <InfluencerRow key={app.id} app={app} actionLoading={actionLoading} onAction={handleInfluencerAction} />
                ))}
              </div>
            )}
          </>
        )}

        {section === 'promotions' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-montserrat)' }}>App Applications</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Apply-to-promote requests from inside the app — profile fields are already on file.</p>
            </div>

            {/* Status tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                  style={{
                    background: activeTab === tab ? 'rgba(255,63,194,0.12)' : 'var(--bg-elevated)',
                    border: activeTab === tab ? '1px solid rgba(255,63,194,0.4)' : '1px solid var(--border)',
                    color: activeTab === tab ? 'var(--accent-magenta)' : 'var(--text-muted)',
                  }}
                >
                  {tab === 'approved' ? <CheckCircle size={13} /> : <Clock size={13} />}
                  {tab === 'pending' ? 'Pending' : tab === 'approved' ? 'Approved' : 'Rejected'}
                  <span className="rounded-full px-1.5 py-0.5 text-xs" style={{ background: 'rgba(255,255,255,0.08)' }}>{promoCounts[tab]}</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="rounded-xl h-32 animate-pulse" style={{ background: 'var(--bg-elevated)' }} />)}</div>
            ) : filteredPromo.length === 0 ? (
              <div className="rounded-xl p-10 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No {activeTab} app applications.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPromo.map((app) => (
                  <PromotionRow key={app.id} app={app} actionLoading={actionLoading} onAction={handlePromotionAction} />
                ))}
              </div>
            )}
          </>
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
      <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs" style={{ color: 'var(--accent-magenta)' }}>{ticket.reference_code}</span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,63,194,0.08)', color: 'var(--text-muted)' }}>{tierLabel}</span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{date}</span>
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Name</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ticket.full_name}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phone</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{ticket.phone}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{ID_TYPE_LABELS[ticket.id_type ?? 'nid'] ?? 'ID'}</p>
            <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{ticket.nid_number}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Gender</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{ticket.gender ? ticket.gender.charAt(0).toUpperCase() + ticket.gender.slice(1) : '—'}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Instagram</p>
            <a href={`https://instagram.com/${ticket.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1 hover:underline" style={{ color: 'var(--accent-magenta)' }}>
              @{ticket.instagram_handle}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xs mr-2" style={{ color: 'var(--text-muted)' }}>Account: <span style={{ color: 'var(--text-primary)' }}>{ticket.user_email}</span></p>
          <button onClick={handleViewNid} disabled={loadingNid} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer" style={{ background: 'rgba(255,63,194,0.08)', border: '1px solid rgba(255,63,194,0.25)', color: 'var(--accent-magenta)' }}>
            <ExternalLink size={12} />
            {loadingNid ? 'Loading…' : `View ${ID_TYPE_LABELS[ticket.id_type ?? 'nid'] ?? 'ID'}`}
          </button>
          {ticket.status === 'pending' && (
            <>
              <button onClick={() => onAction(ticket.id, 'approved')} disabled={!!actionLoading} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer font-semibold" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e' }}>
                <CheckCircle size={12} />
                {actionLoading === ticket.id + 'approved' ? 'Approving…' : 'Approve'}
              </button>
              <button onClick={() => onAction(ticket.id, 'rejected')} disabled={!!actionLoading} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer font-semibold" style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.3)', color: 'var(--accent-pulse)' }}>
                <XCircle size={12} />
                {actionLoading === ticket.id + 'rejected' ? 'Rejecting…' : 'Reject'}
              </button>
            </>
          )}
          {ticket.status !== 'pending' && (
            <span className="text-xs px-2 py-1 rounded font-semibold" style={{ background: ticket.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(255,45,107,0.1)', color: ticket.status === 'approved' ? '#22c55e' : 'var(--accent-pulse)', border: ticket.status === 'approved' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,45,107,0.3)' }}>
              {ticket.status === 'approved' ? '✓ Approved' : '⟳ Processing'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function InfluencerRow({
  app,
  actionLoading,
  onAction,
}: {
  app: InfluencerApp
  actionLoading: string | null
  onAction: (id: string, action: 'approved' | 'rejected') => void
}) {
  const [nidUrl, setNidUrl] = useState<string | null>(null)
  const [loadingNid, setLoadingNid] = useState(false)

  const handleViewId = async () => {
    if (nidUrl) { window.open(nidUrl, '_blank'); return }
    if (!app.nid_file_path) return
    setLoadingNid(true)
    const res = await fetch(`/api/admin/nid-url?path=${encodeURIComponent(app.nid_file_path)}`)
    const json = await res.json()
    if (json.url) { setNidUrl(json.url); window.open(json.url, '_blank') }
    setLoadingNid(false)
  }

  const date = new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2" style={{ background: 'rgba(255,63,194,0.04)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{app.full_name}</span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,63,194,0.1)', color: 'var(--accent-magenta)', border: '1px solid rgba(255,63,194,0.2)' }}>
            {CONTENT_LABELS[app.content_type] ?? app.content_type}
          </span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
            {FOLLOWER_LABELS[app.follower_count] ?? app.follower_count} followers
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{date}</span>
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email</p>
            <p className="text-xs" style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{app.email}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phone</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{app.phone}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{ID_TYPE_LABELS[app.id_type] ?? 'ID'}</p>
            <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{app.id_number}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Gender</p>
            <p className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>{app.gender || '—'}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Instagram</p>
            <a href={`https://instagram.com/${app.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'var(--accent-magenta)' }}>@{app.instagram_handle}</a>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Platform</p>
            <p className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>{app.primary_platform}</p>
          </div>
        </div>

        {app.message && (
          <p className="text-xs mb-4 leading-relaxed px-3 py-2 rounded-lg" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', borderLeft: '2px solid rgba(255,63,194,0.4)' }}>
            &ldquo;{app.message}&rdquo;
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          {app.nid_file_path && (
            <button onClick={handleViewId} disabled={loadingNid} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer" style={{ background: 'rgba(255,63,194,0.08)', border: '1px solid rgba(255,63,194,0.25)', color: 'var(--accent-magenta)' }}>
              <ExternalLink size={12} />
              {loadingNid ? 'Loading…' : `View ${ID_TYPE_LABELS[app.id_type] ?? 'ID'}`}
            </button>
          )}
          {app.status === 'pending' && (
            <>
              <button onClick={() => onAction(app.id, 'approved')} disabled={!!actionLoading} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer font-semibold" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e' }}>
                <CheckCircle size={12} />
                {actionLoading === app.id + 'approved' ? 'Approving…' : 'Approve & send pass'}
              </button>
              <button onClick={() => onAction(app.id, 'rejected')} disabled={!!actionLoading} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer font-semibold" style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.3)', color: 'var(--accent-pulse)' }}>
                <XCircle size={12} />
                {actionLoading === app.id + 'rejected' ? 'Rejecting…' : 'Reject'}
              </button>
            </>
          )}
          {app.status === 'approved' && (
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded font-semibold" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>✓ Approved</span>
              {app.reference_code && <span className="text-xs font-mono" style={{ color: 'var(--accent-magenta)' }}>{app.reference_code}</span>}
            </div>
          )}
          {app.status === 'rejected' && (
            <span className="text-xs px-2 py-1 rounded font-semibold" style={{ background: 'rgba(255,45,107,0.1)', color: 'var(--accent-pulse)', border: '1px solid rgba(255,45,107,0.3)' }}>✗ Rejected</span>
          )}
        </div>
      </div>
    </div>
  )
}

function PromotionRow({
  app,
  actionLoading,
  onAction,
}: {
  app: PromotionApp
  actionLoading: string | null
  onAction: (id: string, action: 'approved' | 'rejected') => void
}) {
  const date = new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2" style={{ background: 'rgba(255,63,194,0.04)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{app.full_name}</span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,63,194,0.1)', color: 'var(--accent-magenta)', border: '1px solid rgba(255,63,194,0.2)' }}>
            {CONTENT_LABELS[app.content_type] ?? app.content_type}
          </span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
            {FOLLOWER_LABELS[app.follower_count] ?? app.follower_count} followers
          </span>
          {app.already_has_ticket && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,182,72,0.12)', color: '#FFB648', border: '1px solid rgba(255,182,72,0.3)' }}>
              Already holds a ticket
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{date}</span>
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phone</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{app.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Instagram</p>
            {app.instagram_handle ? (
              <a href={`https://instagram.com/${app.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'var(--accent-magenta)' }}>@{app.instagram_handle}</a>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>—</p>
            )}
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Platform</p>
            <p className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>{app.primary_platform}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {app.status === 'pending' && (
            <>
              <button onClick={() => onAction(app.id, 'approved')} disabled={!!actionLoading} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer font-semibold" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e' }}>
                <CheckCircle size={12} />
                {actionLoading === app.id + 'approved' ? 'Approving…' : 'Approve & issue ticket'}
              </button>
              <button onClick={() => onAction(app.id, 'rejected')} disabled={!!actionLoading} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer font-semibold" style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.3)', color: 'var(--accent-pulse)' }}>
                <XCircle size={12} />
                {actionLoading === app.id + 'rejected' ? 'Rejecting…' : 'Reject'}
              </button>
            </>
          )}
          {app.status === 'approved' && (
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded font-semibold" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>✓ Approved</span>
              {app.reference_code && <span className="text-xs font-mono" style={{ color: 'var(--accent-magenta)' }}>{app.reference_code}</span>}
            </div>
          )}
          {app.status === 'rejected' && (
            <span className="text-xs px-2 py-1 rounded font-semibold" style={{ background: 'rgba(255,45,107,0.1)', color: 'var(--accent-pulse)', border: '1px solid rgba(255,45,107,0.3)' }}>✗ Rejected</span>
          )}
        </div>
      </div>
    </div>
  )
}
