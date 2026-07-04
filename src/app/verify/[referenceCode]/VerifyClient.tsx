'use client'
import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle, XCircle, Clock, LogIn, LogOut, AlertTriangle, ExternalLink } from 'lucide-react'

const ID_TYPE_LABELS: Record<string, string> = {
  nid: 'National ID (NID)',
  passport: 'Passport',
  birth_certificate: 'Birth Certificate',
}

const TIER_LABELS: Record<string, string> = {
  phase1: 'Phase 1 — Early Bird',
  phase2: 'Phase 2',
  phase3: 'Phase 3 — Last Release',
}

type Ticket = {
  id: string
  fullName: string
  phone: string
  idNumber: string
  idType: string
  ticketTier: string
  status: string
  referenceCode: string
}

type Scan = { scan_type: string; scanned_at: string }

type Props = {
  ticket: Ticket | null
  scans: Scan[]
  isGateStaff: boolean
  nidSignedUrl: string | null
  profilePicUrl: string | null
  referenceCode: string
  dbError: string | null
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

type ScanState = 'never_entered' | 'inside' | 'outside'

function getScanState(scans: Scan[]): ScanState {
  if (scans.length === 0) return 'never_entered'
  return scans[scans.length - 1].scan_type === 'entry' ? 'inside' : 'outside'
}

export default function VerifyClient({ ticket, scans, isGateStaff, nidSignedUrl, profilePicUrl, referenceCode, dbError }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [pendingAction, setPendingAction] = useState<'entry' | 'exit' | null>(null)
  const [localScans, setLocalScans] = useState<Scan[]>(scans)
  const [actionError, setActionError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const scanState = getScanState(localScans)
  const firstEntry = localScans.find((s) => s.scan_type === 'entry')
  const lastScan = localScans[localScans.length - 1]

  const handleConfirm = async () => {
    if (!ticket || !pendingAction) return
    setSubmitting(true)
    setActionError(null)
    const res = await fetch('/api/gate/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: ticket.id, scanType: pendingAction }),
    })
    const json = await res.json()
    setSubmitting(false)
    if (!res.ok) {
      setActionError(json.error ?? 'Something went wrong.')
      setConfirming(false)
      return
    }
    setLocalScans((prev) => [...prev, { scan_type: pendingAction, scanned_at: new Date().toISOString() }])
    setConfirming(false)
    setPendingAction(null)
  }

  // ── Public view (not gate staff) ──────────────────────────────
  if (!isGateStaff) {
    const approved = ticket?.status === 'approved'
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg-void)' }}>
        <div className="w-full max-w-sm text-center">
          <Image src="/images/logo-badge.webp" alt="Sonic Pulse" width={56} height={56} className="rounded-full mx-auto mb-6" style={{ border: '2px solid rgba(255,255,255,0.25)' }} />

          {!ticket ? (
            <>
              <XCircle size={40} className="mx-auto mb-4" style={{ color: 'var(--accent-pulse)' }} />
              <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>Ticket not found</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This QR code does not match any ticket.</p>
              <p className="text-xs mt-2 font-mono" style={{ color: 'var(--text-muted)' }}>Looked up: {referenceCode}</p>
            </>
          ) : !approved ? (
            <>
              <XCircle size={40} className="mx-auto mb-4" style={{ color: 'var(--accent-pulse)' }} />
              <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>Entry not permitted</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This ticket has not been approved.</p>
            </>
          ) : (
            <>
              {scanState === 'never_entered' && <CheckCircle size={40} className="mx-auto mb-4" style={{ color: '#22c55e' }} />}
              {scanState === 'inside' && <LogIn size={40} className="mx-auto mb-4" style={{ color: 'var(--accent-electric)' }} />}
              {scanState === 'outside' && <LogOut size={40} className="mx-auto mb-4" style={{ color: 'var(--accent-volt)' }} />}

              <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>
                {scanState === 'never_entered' && 'Valid ticket'}
                {scanState === 'inside' && 'Currently inside'}
                {scanState === 'outside' && 'Previously attended'}
              </h1>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>{ticket.referenceCode}</p>
              <div className="rounded-lg text-left p-5 space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>Name</p>
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{ticket.fullName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>Tier</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{TIER_LABELS[ticket.ticketTier] ?? ticket.ticketTier}</p>
                </div>
                {firstEntry && (
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>First entry</p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatTime(firstEntry.scanned_at)}</p>
                  </div>
                )}
              </div>
            </>
          )}

          <p className="text-xs mt-8" style={{ color: 'var(--text-muted)' }}>Sonic Pulse · 25 September 2026 · Bashundhara Open Grounds, Dhaka</p>
        </div>
      </main>
    )
  }

  // ── Gate staff view ──────────────────────────────────────────
  const nextAction: 'entry' | 'exit' | null =
    !ticket || ticket.status !== 'approved' ? null
    : scanState === 'never_entered' ? 'entry'
    : scanState === 'inside' ? 'exit'
    : 'entry'

  const actionLabel = nextAction === 'entry'
    ? (scanState === 'outside' ? 'Confirm Re-entry' : 'Confirm Entry')
    : 'Confirm Exit'

  const actionColor = nextAction === 'entry' ? '#22c55e' : 'var(--accent-electric)'

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      {/* Gate header */}
      <div className="sticky top-0 z-30 border-b" style={{ background: 'rgba(5,5,8,0.97)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}>
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/logo-badge.webp" alt="Sonic Pulse" width={26} height={26} className="rounded-full" style={{ border: '1px solid rgba(255,255,255,0.2)' }} />
            <span className="font-black tracking-[0.15em] text-sm" style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--accent-electric)' }}>SONIC PULSE</span>
            <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(204,255,0,0.12)', border: '1px solid rgba(204,255,0,0.3)', color: 'var(--accent-volt)', fontFamily: 'var(--font-jetbrains-mono)' }}>GATE</span>
          </div>
          <a href="/gate" className="text-xs px-3 py-1.5 rounded" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>← Back</a>
        </div>
      </div>

      <div className="max-w-[640px] mx-auto px-4 py-6 space-y-5">
        {/* Not found */}
        {!ticket && (
          <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <XCircle size={40} className="mx-auto mb-3" style={{ color: 'var(--accent-pulse)' }} />
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Ticket not found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>This QR code does not match any ticket in the system.</p>
            <p className="text-xs mt-3 font-mono px-3 py-1.5 rounded inline-block" style={{ background: 'var(--bg-surface)', color: 'var(--accent-electric)', border: '1px solid var(--border)' }}>
              Looked up: {referenceCode}
            </p>
            {dbError && (
              <p className="text-xs mt-2 font-mono px-3 py-1.5 rounded inline-block" style={{ background: 'rgba(255,45,107,0.1)', color: 'var(--accent-pulse)', border: '1px solid rgba(255,45,107,0.3)' }}>
                DB error: {dbError}
              </p>
            )}
          </div>
        )}

        {ticket && (
          <>
            {/* Status banner */}
            {ticket.status !== 'approved' ? (
              <div className="rounded-lg px-5 py-4 flex items-center gap-3" style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.35)' }}>
                <XCircle size={20} style={{ color: 'var(--accent-pulse)' }} />
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--accent-pulse)' }}>Entry not permitted</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Ticket status: {ticket.status}</p>
                </div>
              </div>
            ) : scanState === 'never_entered' ? (
              <div className="rounded-lg px-5 py-4 flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <CheckCircle size={20} style={{ color: '#22c55e' }} />
                <div>
                  <p className="font-bold text-sm" style={{ color: '#22c55e' }}>Valid — Not yet entered</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>First entry — issue wristband on confirmation</p>
                </div>
              </div>
            ) : scanState === 'inside' ? (
              <div className="rounded-lg px-5 py-4 flex items-center gap-3" style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.3)' }}>
                <LogIn size={20} style={{ color: 'var(--accent-electric)' }} />
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--accent-electric)' }}>Currently inside</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Entered at {formatTime(lastScan.scanned_at)}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg px-5 py-4 flex items-center gap-3" style={{ background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.25)' }}>
                <LogOut size={20} style={{ color: 'var(--accent-volt)' }} />
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--accent-volt)' }}>Outside — exited at {formatTime(lastScan.scanned_at)}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Re-entry: verify wristband is present and intact before confirming
                  </p>
                </div>
              </div>
            )}

            {/* Profile photo + identity */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="px-5 py-3 text-xs font-bold tracking-widest uppercase" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>
                Identity Check
              </div>
              <div className="p-5 flex flex-col gap-5">
                {/* Photo */}
                <div className="w-full">
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      alt={ticket.fullName}
                      style={{ width: '100%', maxHeight: 340, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--border)' }}
                    />
                  ) : (
                    <div className="rounded-xl flex items-center justify-center" style={{ width: '100%', height: 200, background: 'var(--bg-surface)', border: '2px dashed var(--border)' }}>
                      <p className="text-sm text-center px-4" style={{ color: 'var(--accent-pulse)' }}>No profile photo — verify ID document manually</p>
                    </div>
                  )}
                </div>
                {/* Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>Name</p>
                    <p className="text-lg font-black" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>{ticket.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>{ID_TYPE_LABELS[ticket.idType] ?? 'ID'}</p>
                    <p className="font-mono text-sm" style={{ color: 'var(--accent-electric)' }}>{ticket.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>Tier</p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{TIER_LABELS[ticket.ticketTier] ?? ticket.ticketTier}</p>
                  </div>
                  {nidSignedUrl && (
                    <a
                      href={nidSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded"
                      style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.25)', color: 'var(--accent-electric)' }}
                    >
                      <ExternalLink size={11} />
                      View ID document
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Scan history */}
            {localScans.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="px-5 py-3 text-xs font-bold tracking-widest uppercase" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>
                  Scan history ({localScans.length})
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {localScans.map((scan, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {scan.scan_type === 'entry'
                          ? <LogIn size={14} style={{ color: '#22c55e' }} />
                          : <LogOut size={14} style={{ color: 'var(--accent-electric)' }} />
                        }
                        <span className="text-sm font-semibold" style={{ color: scan.scan_type === 'entry' ? '#22c55e' : 'var(--accent-electric)' }}>
                          {scan.scan_type === 'entry' ? 'Entry' : 'Exit'}
                          {i === 0 && scan.scan_type === 'entry' && <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>— first entry</span>}
                        </span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{formatDateTime(scan.scanned_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wristband reminder for re-entry */}
            {scanState === 'outside' && (
              <div className="rounded-lg px-4 py-3 flex gap-3" style={{ background: 'rgba(255,45,107,0.07)', border: '1px solid rgba(255,45,107,0.2)' }}>
                <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-pulse)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,248,0.8)' }}>
                  <strong style={{ color: 'var(--accent-pulse)' }}>Wristband check required.</strong> Verify the attendee&apos;s wristband is present and intact before confirming re-entry. Do not allow re-entry without a wristband.
                </p>
              </div>
            )}

            {/* Action error */}
            {actionError && (
              <p className="text-sm rounded px-3 py-2" style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.3)', color: 'var(--accent-pulse)' }}>
                {actionError}
              </p>
            )}

            {/* Action button */}
            {nextAction && (
              <button
                type="button"
                onClick={() => { setPendingAction(nextAction); setConfirming(true) }}
                className="w-full py-4 rounded-xl text-base font-black tracking-wide transition-all cursor-pointer"
                style={{ background: actionColor, color: '#050508', fontFamily: 'var(--font-space-grotesk)' }}
              >
                {actionLabel}
              </button>
            )}
          </>
        )}
      </div>

      {/* Confirm modal */}
      {confirming && ticket && pendingAction && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(5,5,8,0.88)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-sm rounded-xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="px-6 py-5 text-center space-y-2">
              <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>
                {pendingAction === 'entry' && scanState === 'outside' ? 'Confirm Re-entry' : pendingAction === 'entry' ? 'Confirm Entry' : 'Confirm Exit'}
              </p>
              <p className="text-xl font-black" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>
                {ticket.fullName}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{ticket.referenceCode}</p>
              {pendingAction === 'entry' && scanState === 'never_entered' && (
                <p className="text-xs mt-2 px-2" style={{ color: 'rgba(240,240,248,0.6)' }}>
                  Issue a wristband to this attendee after confirming entry.
                </p>
              )}
              {pendingAction === 'entry' && scanState === 'outside' && (
                <p className="text-xs mt-2 px-2" style={{ color: 'var(--accent-pulse)' }}>
                  Wristband confirmed as present and intact?
                </p>
              )}
            </div>
            <div className="px-5 py-4 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => { setConfirming(false); setPendingAction(null) }}
                className="flex-1 py-3 rounded text-sm cursor-pointer"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 py-3 rounded text-sm font-bold cursor-pointer transition-opacity"
                style={{ background: actionColor, color: '#050508', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Recording…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
