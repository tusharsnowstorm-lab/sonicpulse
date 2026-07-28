'use client'
import { useState, useEffect, useCallback } from 'react'
import { ExternalLink } from 'lucide-react'

type Application = {
  id: string
  full_name: string
  email: string
  stage_name: string
  city_country: string
  genres: string
  bio: string
  mix_link: string | null
  instagram_handle: string | null
  years_experience: number | null
  notes: string | null
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected'
  reference_code: string
  created_at: string
}

const STATUS_TABS = ['pending', 'shortlisted', 'accepted', 'rejected'] as const

const STATUS_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  pending: { bg: 'rgba(255,63,194,0.12)', border: '1px solid var(--accent-soft)', color: 'var(--accent-magenta)' },
  shortlisted: { bg: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.4)', color: '#eab308' },
  accepted: { bg: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e' },
  rejected: { bg: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)', color: '#e24b4a' },
}

export default function FirstPulseTab() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [notReady, setNotReady] = useState(false)
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/first-pulse')
    const json = await res.json()
    setApplications(json.applications ?? [])
    setNotReady(!!json.notReady)
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, matches AdminClient's ticket-fetch pattern
  useEffect(() => { fetchApplications() }, [fetchApplications])

  const handleAction = async (applicationId: string, status: Application['status']) => {
    setActionLoading(applicationId + status)
    await fetch('/api/admin/first-pulse', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, status }),
    })
    await fetchApplications()
    setActionLoading(null)
  }

  const filtered = applications.filter((a) => a.status === activeTab)
  const counts = Object.fromEntries(STATUS_TABS.map((s) => [s, applications.filter((a) => a.status === s).length]))

  if (notReady) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
          The First Pulse table hasn&apos;t been created yet — run <code>supabase-first-pulse.sql</code> in the Supabase SQL editor.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff', fontFamily: 'var(--font-montserrat)' }}>First Pulse applications</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>Review the open call for the next wave.</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer capitalize"
            style={{
              background: activeTab === tab ? STATUS_STYLE[tab].bg : 'var(--bg-elevated)',
              border: activeTab === tab ? STATUS_STYLE[tab].border : '1px solid var(--border)',
              color: activeTab === tab ? STATUS_STYLE[tab].color : 'rgba(255,255,255,0.45)',
              touchAction: 'manipulation',
            }}
          >
            {tab}
            <span className="rounded-full px-1.5 py-0.5 text-xs" style={{ background: 'rgba(255,255,255,0.08)' }}>{counts[tab]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: 'var(--bg-elevated)' }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>No {activeTab} applications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const date = new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            return (
              <div key={app.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs" style={{ color: 'var(--accent-magenta)' }}>{app.reference_code}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,63,194,0.08)', color: 'rgba(255,255,255,0.65)' }}>{app.city_country}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{date}</span>
                </div>

                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Name</p>
                      <p className="text-sm font-semibold" style={{ color: '#fff' }}>{app.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Stage name</p>
                      <p className="text-sm" style={{ color: '#fff' }}>{app.stage_name}</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Genres</p>
                      <p className="text-sm" style={{ color: '#fff' }}>{app.genres}</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email</p>
                      <a href={`mailto:${app.email}`} className="text-sm hover:underline" style={{ color: 'var(--accent-magenta)' }}>{app.email}</a>
                    </div>
                  </div>

                  <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{app.bio}</p>

                  <div className="flex items-center gap-3 flex-wrap">
                    {app.mix_link && (
                      <a href={app.mix_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,63,194,0.08)', border: '1px solid var(--accent-soft)', color: 'var(--accent-magenta)' }}>
                        <ExternalLink size={12} />
                        Listen to mix
                      </a>
                    )}
                    {app.instagram_handle && (
                      <a href={`https://instagram.com/${app.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)' }}>
                        @{app.instagram_handle.replace('@', '')}
                      </a>
                    )}
                    {app.years_experience !== null && (
                      <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                        {app.years_experience} yrs experience
                      </span>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      {STATUS_TABS.filter((s) => s !== app.status).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleAction(app.id, s)}
                          disabled={!!actionLoading}
                          className="text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold capitalize"
                          style={{ background: STATUS_STYLE[s].bg, border: STATUS_STYLE[s].border, color: STATUS_STYLE[s].color, touchAction: 'manipulation' }}
                        >
                          {actionLoading === app.id + s ? '…' : s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
