'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  type WayfinderApplication, type ColumnSet,
  GENDER_LABEL, LEVEL_LABEL, SHIFT_LABEL,
  ageOnEventNight, downloadBlob, exportRows, instagramHandles, toCsv,
} from './wayfinderExport'

type Application = WayfinderApplication

const STATUS_TABS = ['pending', 'shortlisted', 'accepted', 'rejected'] as const

const STATUS_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  pending: { bg: 'rgba(255,63,194,0.12)', border: '1px solid var(--accent-soft)', color: 'var(--accent-magenta)' },
  shortlisted: { bg: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.4)', color: '#eab308' },
  accepted: { bg: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e' },
  rejected: { bg: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)', color: '#e24b4a' },
}

const SELECT_STYLE = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  color: 'rgba(255,255,255,0.65)',
  touchAction: 'manipulation',
} as const

type SortOrder = 'newest' | 'oldest'

export default function WayfinderTab() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [notReady, setNotReady] = useState(false)
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [genderFilter, setGenderFilter] = useState('any')
  const [levelFilter, setLevelFilter] = useState('any')
  const [shiftFilter, setShiftFilter] = useState('any')
  const [columnSet, setColumnSet] = useState<ColumnSet>('everything')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [copied, setCopied] = useState(false)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/wayfinder')
    const json = await res.json()
    setApplications(json.applications ?? [])
    setNotReady(!!json.notReady)
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, matches FirstPulseTab's pattern
  useEffect(() => { fetchApplications() }, [fetchApplications])

  const handleAction = async (applicationId: string, status: Application['status']) => {
    setActionLoading(applicationId + status)
    await fetch('/api/admin/wayfinder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, status }),
    })
    await fetchApplications()
    setActionLoading(null)
  }

  const handleShift = async (applicationId: string, assignedShift: 'dusk' | 'dawn') => {
    setActionLoading(applicationId + assignedShift)
    await fetch('/api/admin/wayfinder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, assignedShift }),
    })
    await fetchApplications()
    setActionLoading(null)
  }

  const q = query.trim().toLowerCase().replace(/^@/, '')
  const matchesFilters = (a: Application) => {
    if (q) {
      const haystack = [a.full_name, a.email, a.phone, a.institution, a.instagram_handle ?? '', a.reference_code]
        .join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (genderFilter === 'none') { if (a.gender !== null) return false }
    else if (genderFilter !== 'any' && a.gender !== genderFilter) return false
    if (levelFilter !== 'any' && a.level !== levelFilter) return false
    if (shiftFilter === 'close') { if (!a.stay_to_close) return false }
    else if (shiftFilter === 'unassigned') { if (a.assigned_shift !== null) return false }
    else if (shiftFilter !== 'any' && a.assigned_shift !== shiftFilter) return false
    return true
  }
  const filtered = applications
    .filter((a) => a.status === activeTab && matchesFilters(a))
    .sort((a, b) => {
      const delta = Date.parse(b.created_at) - Date.parse(a.created_at)
      if (Number.isNaN(delta)) return 0
      return sortOrder === 'newest' ? delta : -delta
    })
  const filtersActive = q !== '' || genderFilter !== 'any' || levelFilter !== 'any' || shiftFilter !== 'any'
  const counts = Object.fromEntries(STATUS_TABS.map((s) => [s, applications.filter((a) => a.status === s).length]))
  const accepted = applications.filter((a) => a.status === 'accepted')
  const duskCount = accepted.filter((a) => a.assigned_shift === 'dusk').length
  const dawnCount = accepted.filter((a) => a.assigned_shift === 'dawn').length
  const closeCount = accepted.filter((a) => a.stay_to_close).length
  const femaleCount = accepted.filter((a) => a.gender === 'female').length
  const maleCount = accepted.filter((a) => a.gender === 'male').length
  const unstatedCount = accepted.length - femaleCount - maleCount

  const stamp = () => new Date().toISOString().slice(0, 10)
  const handleDownloadCsv = () => {
    const { headers, rows } = exportRows(filtered, columnSet)
    downloadBlob(`wayfinder-${columnSet}-${activeTab}-${stamp()}.csv`, 'text/csv;charset=utf-8', toCsv(headers, rows))
  }
  const handleCopyJson = () => {
    const { headers, rows } = exportRows(filtered, columnSet)
    const json = JSON.stringify(rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]]))))
    const fallback = () => downloadBlob(`wayfinder-${columnSet}-${activeTab}-${stamp()}.json`, 'application/json', json)
    if (!navigator.clipboard) { fallback(); return }
    navigator.clipboard.writeText(json).then(
      () => { setCopied(true); setTimeout(() => setCopied(false), 2000) },
      fallback,
    )
  }

  if (notReady) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
          The Wayfinder table hasn&apos;t been created yet — run <code>supabase-wayfinder.sql</code> in the Supabase SQL editor.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff', fontFamily: 'var(--font-montserrat)' }}>Wayfinder applications</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Fifty places across two shifts. Accepted: {accepted.length}/50 · Dusk {duskCount}/25 · Dawn {dawnCount}/25 · can stay to close {closeCount} · {femaleCount} female · {maleCount} male · {unstatedCount} not stated
        </p>
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

      {!loading && applications.length > 0 && (
        <>
          <div className="flex gap-2 mb-3 flex-wrap items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, contact or institution"
              className="text-sm px-4 py-2 rounded-full flex-1"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', minWidth: 200, touchAction: 'manipulation' }}
            />
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="text-sm px-3 py-2 rounded-full cursor-pointer" style={SELECT_STYLE}>
              <option value="any">Any gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="none">Not stated</option>
            </select>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="text-sm px-3 py-2 rounded-full cursor-pointer" style={SELECT_STYLE}>
              <option value="any">Any level</option>
              <option value="undergraduate_final">Final-year undergraduate</option>
              <option value="hsc_alevel">HSC / A-level finisher</option>
              <option value="other">Other</option>
            </select>
            <select value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)} className="text-sm px-3 py-2 rounded-full cursor-pointer" style={SELECT_STYLE}>
              <option value="any">Any shift</option>
              <option value="dusk">Assigned dusk</option>
              <option value="dawn">Assigned dawn</option>
              <option value="unassigned">Unassigned</option>
              <option value="close">Can stay to close</option>
            </select>
          </div>
          <div className="flex gap-2 mb-6 flex-wrap items-center">
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)} className="text-sm px-3 py-2 rounded-full cursor-pointer" style={SELECT_STYLE}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <select value={columnSet} onChange={(e) => setColumnSet(e.target.value as ColumnSet)} className="text-sm px-3 py-2 rounded-full cursor-pointer" style={SELECT_STYLE}>
              <option value="everything">Everything</option>
              <option value="summary">Summary</option>
              <option value="contacts">Contacts</option>
            </select>
            <button onClick={handleDownloadCsv} className="text-sm px-4 py-2 rounded-full cursor-pointer font-semibold" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'rgba(255,255,255,0.65)', touchAction: 'manipulation' }}>
              Download CSV
            </button>
            <button onClick={handleCopyJson} className="text-sm px-4 py-2 rounded-full cursor-pointer font-semibold" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'rgba(255,255,255,0.65)', touchAction: 'manipulation' }}>
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
            {filtersActive && (
              <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Showing {filtered.length} of {counts[activeTab]}
              </span>
            )}
          </div>
        </>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: 'var(--bg-elevated)' }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {counts[activeTab] === 0 ? `No ${activeTab} applications.` : 'No applications match these filters.'}
          </p>
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
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,63,194,0.08)', color: 'rgba(255,255,255,0.65)' }}>
                      {SHIFT_LABEL[app.shift_preference]}
                    </span>
                    {app.stay_to_close && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)' }}>
                        can stay to close
                      </span>
                    )}
                    {app.assigned_shift && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                        assigned {SHIFT_LABEL[app.assigned_shift]}
                      </span>
                    )}
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
                      <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Institution</p>
                      <p className="text-sm" style={{ color: '#fff' }}>{app.institution}</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Level</p>
                      <p className="text-sm" style={{ color: '#fff' }}>
                        {LEVEL_LABEL[app.level]}{app.graduation_year ? ` · ${app.graduation_year}` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Contact</p>
                      <a href={`mailto:${app.email}`} className="text-sm hover:underline block" style={{ color: 'var(--accent-magenta)' }}>{app.email}</a>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{app.phone}</span>
                    </div>
                  </div>

                  {app.motivation && (
                    <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{app.motivation}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Emergency contact</p>
                      <p className="text-sm" style={{ color: '#fff' }}>{app.emergency_contact_name} · {app.emergency_contact_phone}</p>
                    </div>
                    {app.date_of_birth && (
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Date of birth</p>
                        <p className="text-sm" style={{ color: '#fff' }}>
                          {app.date_of_birth}{ageOnEventNight(app.date_of_birth) !== null ? ` · ${ageOnEventNight(app.date_of_birth)} on event night` : ''}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Gender</p>
                      <p className="text-sm" style={{ color: '#fff' }}>{app.gender ? GENDER_LABEL[app.gender] : '—'}</p>
                    </div>
                  </div>

                  {app.notes && (
                    <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{app.notes}</p>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    {instagramHandles(app.instagram_handle).map((h) => (
                      <a key={h} href={`https://instagram.com/${h}`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)' }}>
                        @{h}
                      </a>
                    ))}
                    {(['dusk', 'dawn'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleShift(app.id, s)}
                        disabled={!!actionLoading}
                        className="text-xs px-3 py-1.5 rounded-full cursor-pointer"
                        style={{
                          background: app.assigned_shift === s ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                          color: app.assigned_shift === s ? '#22c55e' : 'rgba(255,255,255,0.65)',
                          touchAction: 'manipulation',
                        }}
                      >
                        {actionLoading === app.id + s ? '…' : `assign ${SHIFT_LABEL[s]}`}
                      </button>
                    ))}

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
