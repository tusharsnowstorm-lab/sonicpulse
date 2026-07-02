'use client'
import { useState } from 'react'
import { Download, CheckCircle, Clock, XCircle, ArrowRightLeft, X } from 'lucide-react'
import { ticketTiers } from '@/data/tickets'
import FileUpload from '@/components/ui/FileUpload'

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

const STATUS_CONFIG = {
  pending:  { label: 'Pending review', icon: Clock,       color: 'var(--accent-volt)' },
  approved: { label: 'Approved',        icon: CheckCircle, color: '#22c55e' },
  rejected: { label: 'Processing',       icon: Clock,       color: 'var(--accent-volt)' },
}

const inputStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '10px 12px',
  width: '100%',
  fontSize: 14,
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: 6,
  fontFamily: 'var(--font-jetbrains-mono)',
}

type IdType = 'nid' | 'passport' | 'birth_certificate'
const ID_TYPE_OPTIONS: { value: IdType; short: string; placeholder: string; docLabel: string }[] = [
  { value: 'nid',               short: 'NID',              placeholder: '10 or 17 digit NID',         docLabel: 'NID Document' },
  { value: 'passport',          short: 'Passport',         placeholder: 'e.g. AB1234567',             docLabel: 'Passport Document' },
  { value: 'birth_certificate', short: 'Birth Certificate', placeholder: '17-digit certificate number', docLabel: 'Birth Certificate Document' },
]

function TransferForm({ ticket, onClose, onSuccess }: { ticket: Ticket; onClose: () => void; onSuccess: () => void }) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [nidNumber, setNidNumber] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [gender, setGender] = useState('')
  const [idType, setIdType] = useState<IdType>('nid')
  const [nidFile, setNidFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const selectedIdOption = ID_TYPE_OPTIONS.find((o) => o.value === idType) ?? ID_TYPE_OPTIONS[0]

  const handleSubmit = async () => {
    if (!fullName || !phone || !nidNumber || !instagramHandle || !gender) {
      setError('All fields are required.')
      return
    }
    if (!nidFile) { setFileError(`${selectedIdOption.docLabel} is required.`); return }
    if (!confirmed) { setError('Please confirm the transfer.'); return }

    setError(null)
    setFileError(null)
    setSubmitting(true)

    const fd = new FormData()
    fd.append('ticketId', ticket.id)
    fd.append('fullName', fullName)
    fd.append('phone', phone)
    fd.append('nidNumber', nidNumber)
    fd.append('idType', idType)
    fd.append('instagramHandle', instagramHandle.replace(/^@/, ''))
    fd.append('gender', gender)
    fd.append('nidFile', nidFile)

    const res = await fetch('/api/tickets/transfer', { method: 'POST', body: fd })
    const json = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(json.error ?? 'Something went wrong.')
    } else {
      onSuccess()
    }
  }

  return (
    <div className="mt-4 space-y-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: 'var(--accent-volt)' }}>Transfer ticket to someone else</p>
        <button type="button" onClick={onClose} className="cursor-pointer" style={{ color: 'var(--text-muted)' }}>
          <X size={14} />
        </button>
      </div>

      <div
        className="rounded px-3 py-2 text-xs"
        style={{ background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.2)', color: 'rgba(240,240,248,0.65)' }}
      >
        The new holder&apos;s details will go through the approval process. Your ticket slot is preserved.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Full name (as on ID document)</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} placeholder="Mohammad Rahman" />
        </div>
        <div>
          <label style={labelStyle}>Phone number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="+8801XXXXXXXXX" />
        </div>
      </div>

      <div>
        <label style={labelStyle}>ID document type</label>
        <div className="grid grid-cols-3 gap-2">
          {ID_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setIdType(opt.value)}
              className="py-2 px-1 rounded text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: idType === opt.value ? 'rgba(0,240,255,0.12)' : 'var(--bg-surface)',
                border: idType === opt.value ? '2px solid var(--accent-electric)' : '2px solid var(--border)',
                color: idType === opt.value ? 'var(--accent-electric)' : 'var(--text-muted)',
              }}
            >
              {opt.short}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>{selectedIdOption.short} number</label>
          <input value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} style={inputStyle} placeholder={selectedIdOption.placeholder} />
        </div>
        <div>
          <label style={labelStyle}>Instagram handle</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>@</span>
            <input value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))} style={{ ...inputStyle, paddingLeft: 28 }} placeholder="theirhandle" />
          </div>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Gender</label>
        <div className="grid grid-cols-2 gap-3">
          {['male', 'female'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className="py-2.5 rounded text-sm font-semibold transition-all cursor-pointer"
              style={{
                background: gender === g ? 'rgba(0,240,255,0.12)' : 'var(--bg-surface)',
                border: gender === g ? '2px solid var(--accent-electric)' : '2px solid var(--border)',
                color: gender === g ? 'var(--accent-electric)' : 'var(--text-muted)',
              }}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>{selectedIdOption.docLabel}</label>
        <FileUpload onChange={(f) => { setNidFile(f); if (f) setFileError(null) }} label={selectedIdOption.docLabel} error={fileError ?? undefined} />
      </div>

      <label className="flex items-start gap-3 cursor-pointer select-none" style={{ touchAction: 'manipulation' }}>
        <div className="relative mt-0.5 shrink-0">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="sr-only" />
          <div
            className="w-5 h-5 rounded flex items-center justify-center transition-colors"
            style={{
              background: confirmed ? 'var(--accent-electric)' : 'var(--bg-surface)',
              border: confirmed ? '2px solid var(--accent-electric)' : '2px solid var(--border)',
            }}
          >
            {confirmed && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4L4 7L10 1" stroke="#050508" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,248,0.7)' }}>
          I confirm I want to transfer ticket <strong style={{ color: 'var(--text-primary)' }}>{ticket.reference_code}</strong> to this person. This cannot be undone once approved.
        </span>
      </label>

      {error && (
        <p className="text-xs rounded px-3 py-2" style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.3)', color: 'var(--accent-pulse)' }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !confirmed}
        className="w-full py-3 rounded text-sm font-bold transition-all cursor-pointer"
        style={{
          background: confirmed ? 'var(--accent-volt)' : 'rgba(204,255,0,0.1)',
          color: confirmed ? '#050508' : 'rgba(204,255,0,0.3)',
          cursor: confirmed ? 'pointer' : 'not-allowed',
        }}
      >
        {submitting ? 'Submitting transfer…' : 'Submit transfer for approval'}
      </button>
    </div>
  )
}

export default function TicketCard({ ticket, onRefresh, profilePicUrl }: { ticket: Ticket; onRefresh?: () => void; profilePicUrl?: string }) {
  const [generating, setGenerating] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const tier = ticketTiers.find((t) => t.id === ticket.ticket_tier)
  const { label: statusLabel, icon: StatusIcon, color: statusColor } = STATUS_CONFIG[ticket.status]

  const downloadTicket = async () => {
    setGenerating(true)
    try {
      const QRCode = (await import('qrcode')).default
      const verifyUrl = `${window.location.origin}/verify/${ticket.reference_code}`
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 180,
        margin: 2,
        color: { dark: '#050508', light: '#F0F0F8' },
      })

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Sonic Pulse Ticket — ${ticket.reference_code}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=JetBrains+Mono:wght@500&display=swap');
  body { margin: 0; background: #050508; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: Arial, sans-serif; }
  .ticket { width: 480px; background: #050508; border: 1.5px solid rgba(0,240,255,0.35); border-radius: 8px; overflow: hidden; color: #F0F0F8; }
  .top { padding: 24px; border-bottom: 1.5px dashed rgba(0,240,255,0.2); display: flex; justify-content: space-between; align-items: flex-start; }
  .wordmark { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 28px; letter-spacing: 0.08em; }
  .wordmark span { color: #00F0FF; }
  .sub { font-size: 11px; color: #6B6B7E; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
  .badge { width: 52px; height: 52px; border-radius: 50%; background: radial-gradient(ellipse at 50% 35%, #d070e8 0%, #8030b0 60%, #300050 100%); border: 2px solid rgba(255,255,255,0.4); opacity: 0.85; object-fit: cover; }
  .mid { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
  .info { flex: 1; }
  .field-label { font-size: 10px; color: #6B6B7E; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 3px; font-family: 'JetBrains Mono', monospace; }
  .field-val { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
  .ref { font-family: 'JetBrains Mono', monospace; color: #00F0FF; font-size: 13px; }
  .tier { font-family: 'JetBrains Mono', monospace; color: #CCFF00; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
  .qr img { width: 120px; height: 120px; border-radius: 4px; }
  .bottom { background: #0D0D14; padding: 14px 24px; border-top: 1px dashed rgba(0,240,255,0.15); font-family: 'JetBrains Mono', monospace; }
  .bottom-ref { font-size: 10px; color: #6B6B7E; display: flex; justify-content: space-between; margin-bottom: 10px; }
  .disclaimers { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; display: flex; flex-direction: column; gap: 4px; }
  .disclaimers-heading { font-size: 8px; font-weight: 700; color: #ffffff; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px; }
  .disclaimer { font-size: 9px; color: #c8c8d8; letter-spacing: 0.05em; line-height: 1.4; display: flex; gap: 6px; }
  .disclaimer::before { content: '—'; color: #FF2D6B; flex-shrink: 0; }
</style>
</head>
<body>
<div class="ticket">
  <div class="top">
    <div>
      <div class="sub">Dhaka Music Festival</div>
      <div class="wordmark">SONIC<span>PULSE</span></div>
      <div class="sub" style="margin-top:4px;">15 NOV 2025 · 22:00 → 06:00</div>
    </div>
    ${profilePicUrl
      ? `<img src="${profilePicUrl}" class="badge" alt="Profile" />`
      : `<div class="badge"></div>`
    }
  </div>
  <div class="mid">
    <div class="info">
      <div class="field-label">Attendee</div>
      <div class="field-val">${ticket.full_name}</div>
      <div class="field-label">Phase</div>
      <div class="tier">${tier?.label ?? ticket.ticket_tier}</div>
      <div class="ref" style="margin-top:10px;">${ticket.reference_code}</div>
    </div>
    <div class="qr"><img src="${qrDataUrl}" alt="Verification QR code" /></div>
  </div>
  <div class="bottom">
    <div class="bottom-ref">
      <span>${ticket.reference_code}</span>
      <span>Scan to verify at entry</span>
    </div>
    <div class="disclaimers">
      <div class="disclaimers-heading">Please read carefully before attending the event</div>
      <div class="disclaimer">The profile photo on this ticket is used for identity verification at the gate. Only accurate, recent photos are accepted. Entry will be refused if the photo does not match the attendee.</div>
      <div class="disclaimer">This ticket is strictly non-transferable. The name on this ticket must match the ID presented at the gate.</div>
      <div class="disclaimer">This ticket is valid for one entry only. It will be scanned and marked as used upon first entry.</div>
      <div class="disclaimer">A wristband will be issued on entry. The wristband must remain on at all times and cannot be removed without cutting. It serves as proof of entry for re-admission.</div>
      <div class="disclaimer">Your ticket QR code will be scanned each time you enter or exit the venue. Present your wristband for re-entry after exiting.</div>
      <div class="disclaimer">Sonic Pulse reserves the right to refuse entry. No refunds will be issued for refused entry due to policy violations.</div>
    </div>
  </div>
</div>
</body>
</html>`

      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sonic-pulse-ticket-${ticket.reference_code}.html`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      {/* Header stripe */}
      <div
        className="px-4 py-2 flex items-center justify-between text-xs"
        style={{
          background: ticket.status === 'approved' ? 'rgba(34,197,94,0.08)' : 'rgba(204,255,0,0.06)',
          borderBottom: '1px solid var(--border)',
          fontFamily: 'var(--font-jetbrains-mono)',
        }}
      >
        <div className="flex items-center gap-1.5" style={{ color: statusColor }}>
          <StatusIcon size={13} />
          {statusLabel}
        </div>
        <span style={{ color: 'var(--text-muted)' }}>{ticket.reference_code}</span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-base" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>
              {ticket.full_name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>
              {tier?.label ?? ticket.ticket_tier}
              {tier ? ` — ৳${tier.price.toLocaleString()}` : ''}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {ticket.phone}
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {ticket.status === 'approved' && (
              profilePicUrl ? (
                <button
                  onClick={downloadTicket}
                  disabled={generating}
                  className="flex items-center gap-1.5 rounded px-3 py-2 text-xs font-semibold transition-colors cursor-pointer"
                  style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', color: 'var(--accent-electric)' }}
                  aria-label={`Download ticket for ${ticket.full_name}`}
                >
                  <Download size={13} />
                  {generating ? 'Building…' : 'Download'}
                </button>
              ) : (
                <div
                  className="rounded px-3 py-2 text-xs"
                  style={{ background: 'rgba(255,45,107,0.08)', border: '1px solid rgba(255,45,107,0.25)', color: 'var(--accent-pulse)', maxWidth: 160 }}
                >
                  Add a profile photo to download your ticket
                </div>
              )
            )}

            {(ticket.status === 'approved' || ticket.status === 'pending') && (
              <button
                onClick={() => setShowTransfer((v) => !v)}
                className="flex items-center gap-1.5 rounded px-3 py-2 text-xs font-semibold transition-colors cursor-pointer"
                style={{
                  background: showTransfer ? 'rgba(204,255,0,0.12)' : 'rgba(204,255,0,0.06)',
                  border: '1px solid rgba(204,255,0,0.25)',
                  color: 'var(--accent-volt)',
                }}
              >
                <ArrowRightLeft size={13} />
                Transfer
              </button>
            )}
          </div>
        </div>

        {ticket.status === 'pending' && !showTransfer && (
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Under review. You&apos;ll receive an email once approved.
          </p>
        )}
        {ticket.status === 'rejected' && (
          <p className="text-xs mt-3" style={{ color: 'var(--accent-volt)' }}>
            Your ticket is being processed. You&apos;ll receive an email once approved.
          </p>
        )}

        {showTransfer && (
          <TransferForm
            ticket={ticket}
            onClose={() => setShowTransfer(false)}
            onSuccess={() => { setShowTransfer(false); onRefresh?.() }}
          />
        )}
      </div>
    </div>
  )
}
