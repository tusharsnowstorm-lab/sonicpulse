'use client'
import { useState } from 'react'
import { Download, CheckCircle, Clock, XCircle } from 'lucide-react'
import { ticketTiers } from '@/data/tickets'

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
  rejected: { label: 'Rejected',        icon: XCircle,     color: 'var(--accent-pulse)' },
}

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const [generating, setGenerating] = useState(false)
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

      // Build a printable HTML ticket
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
  .badge { width: 52px; height: 52px; border-radius: 50%; background: radial-gradient(ellipse at 50% 35%, #d070e8 0%, #8030b0 60%, #300050 100%); border: 2px solid rgba(255,255,255,0.4); opacity: 0.85; }
  .mid { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
  .info { flex: 1; }
  .field-label { font-size: 10px; color: #6B6B7E; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 3px; font-family: 'JetBrains Mono', monospace; }
  .field-val { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
  .ref { font-family: 'JetBrains Mono', monospace; color: #00F0FF; font-size: 13px; }
  .tier { font-family: 'JetBrains Mono', monospace; color: #CCFF00; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
  .qr img { width: 120px; height: 120px; border-radius: 4px; }
  .bottom { background: #0D0D14; padding: 10px 24px; border-top: 1px dashed rgba(0,240,255,0.15); font-size: 10px; color: #6B6B7E; font-family: 'JetBrains Mono', monospace; display: flex; justify-content: space-between; }
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
    <div class="badge"></div>
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
    <span>NID: ${ticket.nid_number.slice(0, 4)}••••••</span>
    <span>Non-transferable · Scan to verify</span>
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
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      {/* Header stripe */}
      <div
        className="px-4 py-2 flex items-center justify-between text-xs"
        style={{
          background: ticket.status === 'approved' ? 'rgba(34,197,94,0.08)' : ticket.status === 'rejected' ? 'rgba(255,45,107,0.08)' : 'rgba(204,255,0,0.06)',
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

          {ticket.status === 'approved' && (
            <button
              onClick={downloadTicket}
              disabled={generating}
              className="flex items-center gap-1.5 rounded px-3 py-2 text-xs font-semibold transition-colors"
              style={{
                background: 'rgba(0,240,255,0.1)',
                border: '1px solid rgba(0,240,255,0.3)',
                color: 'var(--accent-electric)',
                flexShrink: 0,
              }}
              aria-label={`Download ticket for ${ticket.full_name}`}
            >
              <Download size={13} />
              {generating ? 'Building…' : 'Download'}
            </button>
          )}
        </div>

        {ticket.status === 'pending' && (
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Under review. You&apos;ll receive an email once approved.
          </p>
        )}
        {ticket.status === 'rejected' && (
          <p className="text-xs mt-3" style={{ color: 'var(--accent-pulse)' }}>
            This ticket was not approved. Contact us for details.
          </p>
        )}
      </div>
    </div>
  )
}
