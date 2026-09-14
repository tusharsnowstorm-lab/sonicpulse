'use client'
import { useState, useEffect, useCallback } from 'react'
import { VENDOR_STATUSES, STATUS_LABEL, packageByCode, bdt, type VendorStatus, type PackageCode } from '@/data/vendors'

type VendorApplication = {
  id: string
  agreement_ref: string
  package_code: PackageCode
  stalls: number
  stall_fee: number
  business_name: string
  contact_person: string
  phone: string
  email: string
  business_address: string
  trade_licence: string | null
  goods_description: string
  electrical_loads: string | null
  cooking_equipment: string | null
  staff_list: string | null
  signatory_name: string
  signatory_designation: string
  signed_at: string
  signed_ip: string | null
  signed_user_agent: string | null
  contract_version: string
  contract_hash: string
  acknowledged_clauses: string[]
  status: VendorStatus
  receipt_paths: string[]
  receipt_uploaded_at: string | null
  countersigned_by: string | null
  countersigned_designation: string | null
  confirmed_at: string | null
  admin_note: string | null
  created_at: string
}

const STATUS_STYLE: Record<VendorStatus, { bg: string; border: string; color: string }> = {
  awaiting_payment: { bg: 'rgba(255,63,194,0.12)', border: '1px solid var(--accent-soft)', color: 'var(--accent-magenta)' },
  paid_pending_verification: { bg: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.4)', color: '#eab308' },
  confirmed: { bg: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e' },
  lapsed: { bg: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)', color: '#e24b4a' },
  rejected: { bg: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)', color: '#e24b4a' },
  cancelled_by_organiser: { bg: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)', color: '#e24b4a' },
}

function fmtBST(iso: string): string {
  return (
    new Date(iso).toLocaleString('en-GB', {
      timeZone: 'Asia/Dhaka',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' BST'
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
      <div className="text-sm" style={{ color: '#fff' }}>{children}</div>
    </div>
  )
}

function VendorCard({
  app,
  actionLoading,
  onStatus,
  onNote,
  onGetReceiptUrl,
}: {
  app: VendorApplication
  actionLoading: string | null
  onStatus: (id: string, status: VendorStatus, extra?: { countersignName?: string; countersignDesignation?: string }) => void
  onNote: (id: string, note: string) => void
  onGetReceiptUrl: (path: string) => Promise<string | null>
}) {
  const [confirming, setConfirming] = useState(false)
  const [countersignName, setCountersignName] = useState('')
  const [countersignDesignation, setCountersignDesignation] = useState('')
  const [note, setNote] = useState(app.admin_note ?? '')
  const [noteSaving, setNoteSaving] = useState(false)
  const [receiptLoading, setReceiptLoading] = useState<string | null>(null)

  const pkg = packageByCode(app.package_code)
  const signedDate = new Date(app.signed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const handleConfirm = () => {
    if (!countersignName.trim() || !countersignDesignation.trim()) return
    if (!window.confirm(`Confirm ${app.agreement_ref} and send the written confirmation email?`)) return
    onStatus(app.id, 'confirmed', { countersignName, countersignDesignation })
  }

  const handleCancel = () => {
    if (!window.confirm(`Cancel ${app.agreement_ref}? This does not email the vendor.`)) return
    onStatus(app.id, 'cancelled_by_organiser')
  }

  const handleSaveNote = async () => {
    setNoteSaving(true)
    await onNote(app.id, note)
    setNoteSaving(false)
  }

  const handleViewReceipt = async (path: string) => {
    setReceiptLoading(path)
    const url = await onGetReceiptUrl(path)
    if (url) window.open(url, '_blank')
    setReceiptLoading(null)
  }

  const busy = actionLoading === app.id

  const btnStyle = (kind: 'green' | 'red' | 'neutral'): React.CSSProperties =>
    kind === 'green'
      ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e', touchAction: 'manipulation' }
      : kind === 'red'
      ? { background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)', color: '#e24b4a', touchAction: 'manipulation' }
      : { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'rgba(255,255,255,0.65)', touchAction: 'manipulation' }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs" style={{ color: 'var(--accent-magenta)' }}>{app.agreement_ref}</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,63,194,0.08)', color: 'rgba(255,255,255,0.65)' }}>
            {pkg?.name ?? app.package_code}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)' }}>
            {app.stalls} × {pkg ? bdt(pkg.fee) : ''} = {bdt(app.stall_fee)}
          </span>
        </div>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{signedDate}</span>
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <Field label="Business">{app.business_name}</Field>
          <Field label="Contact">{app.contact_person}</Field>
          <Field label="Phone">{app.phone}</Field>
          <Field label="Email"><a href={`mailto:${app.email}`} className="hover:underline" style={{ color: 'var(--accent-magenta)' }}>{app.email}</a></Field>
          <Field label="Address">{app.business_address}</Field>
          <Field label="Trade licence">{app.trade_licence || '—'}</Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Sells">{app.goods_description}</Field>
          <Field label="Electrical loads">{app.electrical_loads || '—'}</Field>
          <Field label="Cooking / LPG">{app.cooking_equipment || '—'}</Field>
          <Field label="Staff">
            <span style={{ whiteSpace: 'pre-wrap' }}>{app.staff_list || '—'}</span>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Signed">
            {app.signatory_name}, {app.signatory_designation} · {fmtBST(app.signed_at)}{app.signed_ip ? ` · ${app.signed_ip}` : ''}
          </Field>
          <Field label="Agreement">{app.contract_version} · {app.contract_hash.slice(0, 12)}…</Field>
        </div>

        <div className="mb-4">
          <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Receipts</p>
          {app.receipt_paths.length === 0 ? (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>None uploaded</p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {app.receipt_paths.map((path, i) => (
                <button
                  key={path}
                  onClick={() => handleViewReceipt(path)}
                  disabled={receiptLoading === path}
                  className="text-xs px-3 py-1.5 rounded-full cursor-pointer"
                  style={{ background: 'rgba(255,63,194,0.08)', border: '1px solid var(--accent-soft)', color: 'var(--accent-magenta)', touchAction: 'manipulation' }}
                >
                  {receiptLoading === path ? 'Loading…' : `View receipt ${i + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {app.status === 'confirmed' && app.countersigned_by && (
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Countersigned by {app.countersigned_by}, {app.countersigned_designation} on {app.confirmed_at ? fmtBST(app.confirmed_at) : ''}.
          </p>
        )}

        <div className="mb-4">
          <p className="text-xs mb-1" style={{ color: 'var(--text-label-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin note</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: '#fff', minHeight: 60, resize: 'vertical' }}
          />
          <button
            onClick={handleSaveNote}
            disabled={noteSaving}
            className="text-xs px-3 py-1.5 rounded-full cursor-pointer mt-2"
            style={{ ...btnStyle('neutral') }}
          >
            {noteSaving ? 'Saving…' : 'Save note'}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {app.status === 'awaiting_payment' && (
            <>
              <button onClick={() => onStatus(app.id, 'paid_pending_verification')} disabled={busy} className="text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold" style={btnStyle('neutral')}>
                {busy ? '…' : 'Mark paid — pending verification'}
              </button>
              <button onClick={() => onStatus(app.id, 'lapsed')} disabled={busy} className="text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold" style={btnStyle('red')}>
                {busy ? '…' : 'Lapse'}
              </button>
              <button onClick={() => onStatus(app.id, 'rejected')} disabled={busy} className="text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold" style={btnStyle('red')}>
                {busy ? '…' : 'Reject'}
              </button>
            </>
          )}

          {app.status === 'paid_pending_verification' && !confirming && (
            <>
              <button onClick={() => setConfirming(true)} disabled={busy} className="text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold" style={btnStyle('green')}>
                Confirm — funds cleared
              </button>
              <button onClick={() => onStatus(app.id, 'awaiting_payment')} disabled={busy} className="text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold" style={btnStyle('neutral')}>
                {busy ? '…' : 'Back to awaiting payment'}
              </button>
              <button onClick={() => onStatus(app.id, 'rejected')} disabled={busy} className="text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold" style={btnStyle('red')}>
                {busy ? '…' : 'Reject'}
              </button>
            </>
          )}

          {app.status === 'paid_pending_verification' && confirming && (
            <div className="flex items-center gap-2 flex-wrap w-full">
              <input
                value={countersignName}
                onChange={(e) => setCountersignName(e.target.value)}
                placeholder="Countersigner name"
                className="text-sm px-3 py-1.5 rounded-full"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: '#fff', touchAction: 'manipulation' }}
              />
              <input
                value={countersignDesignation}
                onChange={(e) => setCountersignDesignation(e.target.value)}
                placeholder="Designation"
                className="text-sm px-3 py-1.5 rounded-full"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: '#fff', touchAction: 'manipulation' }}
              />
              <button
                onClick={handleConfirm}
                disabled={busy || !countersignName.trim() || !countersignDesignation.trim()}
                className="text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold"
                style={btnStyle('green')}
              >
                {busy ? '…' : 'Countersign and confirm'}
              </button>
              <button onClick={() => setConfirming(false)} className="text-xs px-3 py-1.5 rounded-full cursor-pointer" style={btnStyle('neutral')}>
                Cancel
              </button>
            </div>
          )}

          {app.status === 'confirmed' && (
            <button onClick={handleCancel} disabled={busy} className="text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold" style={btnStyle('red')}>
              {busy ? '…' : 'Cancel booking (organiser)'}
            </button>
          )}

          {(app.status === 'lapsed' || app.status === 'rejected' || app.status === 'cancelled_by_organiser') && (
            <button onClick={() => onStatus(app.id, 'awaiting_payment')} disabled={busy} className="text-xs px-3 py-1.5 rounded-full cursor-pointer font-semibold" style={btnStyle('neutral')}>
              {busy ? '…' : 'Reopen — awaiting payment'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VendorsTab() {
  const [applications, setApplications] = useState<VendorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [notReady, setNotReady] = useState(false)
  const [activeTab, setActiveTab] = useState<VendorStatus>('awaiting_payment')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [receiptUrls, setReceiptUrls] = useState<Record<string, string>>({})

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/vendors')
    const json = await res.json()
    setApplications(json.applications ?? [])
    setNotReady(!!json.notReady)
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, matches WayfinderTab's pattern
  useEffect(() => { fetchApplications() }, [fetchApplications])

  const handleStatus = async (
    id: string,
    status: VendorStatus,
    extra?: { countersignName?: string; countersignDesignation?: string }
  ) => {
    setActionLoading(id)
    await fetch('/api/admin/vendors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: id, status, ...extra }),
    })
    await fetchApplications()
    setActionLoading(null)
  }

  const handleNote = async (id: string, adminNote: string) => {
    await fetch('/api/admin/vendors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: id, adminNote }),
    })
    await fetchApplications()
  }

  const getReceiptUrl = async (path: string) => {
    if (receiptUrls[path]) return receiptUrls[path]
    const res = await fetch(`/api/admin/vendors/receipt-url?path=${encodeURIComponent(path)}`)
    const json = await res.json()
    if (json.url) {
      setReceiptUrls((prev) => ({ ...prev, [path]: json.url }))
      return json.url
    }
    return null
  }

  const q = query.trim().toLowerCase()
  const matchesQuery = (a: VendorApplication) => {
    if (!q) return true
    const haystack = [a.agreement_ref, a.business_name, a.email, a.contact_person].join(' ').toLowerCase()
    return haystack.includes(q)
  }

  const filtered = applications
    .filter((a) => a.status === activeTab && matchesQuery(a))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))

  const counts = Object.fromEntries(VENDOR_STATUSES.map((s) => [s, applications.filter((a) => a.status === s).length]))
  const totalStalls = applications.reduce((sum, a) => sum + a.stalls, 0)
  const confirmedTotal = applications.filter((a) => a.status === 'confirmed').reduce((sum, a) => sum + a.stall_fee, 0)

  if (notReady) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Vendor table not created yet. Run <code>supabase-vendors.sql</code> in the Supabase SQL editor (project ytgwocaresxghgyiwikr), then reload.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff', fontFamily: 'var(--font-montserrat)' }}>Vendor stalls</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Applications, payments and countersignature. Confirming sends the Clause 1 written confirmation.
        </p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {VENDOR_STATUSES.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer"
            style={{
              background: activeTab === tab ? STATUS_STYLE[tab].bg : 'var(--bg-elevated)',
              border: activeTab === tab ? STATUS_STYLE[tab].border : '1px solid var(--border)',
              color: activeTab === tab ? STATUS_STYLE[tab].color : 'rgba(255,255,255,0.45)',
              touchAction: 'manipulation',
            }}
          >
            {STATUS_LABEL[tab]}
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
              placeholder="Search reference, business, email"
              className="text-sm px-4 py-2 rounded-full flex-1"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', minWidth: 200, touchAction: 'manipulation' }}
            />
          </div>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {applications.length} applications · {totalStalls} stalls · {bdt(confirmedTotal)} confirmed
          </p>
        </>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: 'var(--bg-elevated)' }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {counts[activeTab] === 0 ? `No ${STATUS_LABEL[activeTab].toLowerCase()} applications.` : 'No applications match this search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <VendorCard
              key={app.id}
              app={app}
              actionLoading={actionLoading}
              onStatus={handleStatus}
              onNote={handleNote}
              onGetReceiptUrl={getReceiptUrl}
            />
          ))}
        </div>
      )}
    </div>
  )
}
