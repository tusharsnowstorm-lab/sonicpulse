'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { BankDetails } from '@/data/vendor-contract'
import { PAYMENT_DEADLINE, VENDOR_CONTACT_EMAIL } from '@/data/vendors'

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--accent-magenta)' : 'var(--text-label-muted)', padding: 4, touchAction: 'manipulation', display: 'inline-flex' }}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  )
}

function Row({ label, value, mono, copyLabel }: { label: string; value: string; mono?: boolean; copyLabel?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-label-muted)', fontWeight: 700 }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: mono ? 22 : 16, fontWeight: mono ? 700 : 600, color: '#fff', fontFamily: mono ? 'monospace' : undefined, letterSpacing: mono ? '0.06em' : undefined, wordBreak: 'break-word' }}>
          {value}
        </span>
        {copyLabel && <CopyButton value={value} label={copyLabel} />}
      </span>
    </div>
  )
}

/**
 * The organiser's settlement account, shown wherever a vendor needs to pay
 * (§8.68). `bank` is null until the three VENDOR_BANK_* env vars are set.
 */
export default function BankDetailsCard({ bank, paymentReference, note }: { bank: BankDetails | null; paymentReference: string; note?: string }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--accent-soft)', borderRadius: 'var(--radius-card)', padding: '26px 28px' }}>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-magenta)', fontWeight: 700, marginBottom: 8 }}>
        Pay by bank transfer
      </p>
      <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.65, marginBottom: 14 }}>
        Full Stall Fee in one payment, by {PAYMENT_DEADLINE}. Bank transfer only — no cash, cheque, bKash, Nagad or card. No deposit or part-payment holds a stall.
      </p>

      {bank ? (
        <>
          <Row label="Account name" value={bank.accountName} />
          <Row label="Bank and branch" value={bank.bankBranch} />
          <Row label="Account number" value={bank.accountNumber} mono copyLabel="Copy account number" />
        </>
      ) : (
        <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>Bank details are sent by email as soon as you apply.</p>
          <p style={{ fontSize: 12.5, color: 'var(--text-label-muted)', marginTop: 4 }}>They come from {VENDOR_CONTACT_EMAIL} with your agreement reference.</p>
        </div>
      )}

      <Row label="Payment reference" value={paymentReference} mono copyLabel="Copy payment reference" />

      {note && (
        <p style={{ fontSize: 12.5, color: 'var(--text-label-muted)', lineHeight: 1.6, marginTop: 12 }}>{note}</p>
      )}
    </div>
  )
}
