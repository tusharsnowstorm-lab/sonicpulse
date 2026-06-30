'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Instagram, X } from 'lucide-react'
import FileUpload from '@/components/ui/FileUpload'
import Button from '@/components/ui/Button'
import { CURRENT_PHASE, ticketTiers } from '@/data/tickets'

const schema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phone: z.string().regex(/^(\+?880|0)1[3-9]\d{8}$/, 'Enter a valid Bangladesh phone number'),
  nidNumber: z.string().regex(/^\d{10}$|^\d{17}$/, 'NID must be 10 or 17 digits'),
  ticketTier: z.enum(['phase1', 'phase2', 'phase3']),
})

type Fields = z.infer<typeof schema>

function InstagramWarningModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [checked, setChecked] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-md rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(204,255,0,0.05)' }}
        >
          <div className="flex items-center gap-2.5">
            <Instagram size={18} style={{ color: 'var(--accent-volt)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--accent-volt)', fontFamily: 'var(--font-space-grotesk)' }}>
              Important — Before you submit
            </span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            As part of the ticket approval process, we verify attendees via Instagram.
          </p>
          <div
            className="rounded-lg px-4 py-4 text-sm space-y-2"
            style={{ background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.2)' }}
          >
            <p style={{ color: 'rgba(240,240,248,0.8)' }}>
              If your Instagram account is <strong style={{ color: 'var(--text-primary)' }}>private</strong>, you will receive a follow request from:
            </p>
            <p
              className="text-base font-bold tracking-wide"
              style={{ color: 'var(--accent-volt)', fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              @dhakamusicfestival
            </p>
            <p style={{ color: 'rgba(240,240,248,0.65)' }}>
              You <strong style={{ color: 'var(--text-primary)' }}>must accept</strong> this follow request for your ticket to be approved. Ignoring it will result in your ticket not being verified.
            </p>
          </div>

          {/* Checkbox */}
          <label
            className="flex items-start gap-3 cursor-pointer select-none"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="sr-only"
              />
              <div
                className="w-5 h-5 rounded flex items-center justify-center transition-colors"
                style={{
                  background: checked ? 'var(--accent-electric)' : 'var(--bg-surface)',
                  border: checked ? '2px solid var(--accent-electric)' : '2px solid var(--border)',
                }}
              >
                {checked && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4L4 7L10 1" stroke="#050508" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm leading-relaxed" style={{ color: 'rgba(240,240,248,0.7)' }}>
              I understand that if my Instagram is private, I must accept the follow request from <strong style={{ color: 'var(--text-primary)' }}>@dhakamusicfestival</strong> to complete my ticket approval.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 flex flex-col sm:flex-row gap-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-3 rounded text-sm cursor-pointer transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!checked}
            className="w-full sm:flex-1 px-4 py-3 rounded text-sm font-bold transition-all cursor-pointer"
            style={{
              background: checked ? 'var(--accent-electric)' : 'rgba(0,240,255,0.15)',
              color: checked ? '#050508' : 'rgba(0,240,255,0.35)',
              cursor: checked ? 'pointer' : 'not-allowed',
            }}
          >
            I understand — Submit ticket
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AddTicketForm({ onSuccess }: { onSuccess: () => void }) {
  const [nidFile, setNidFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [pendingData, setPendingData] = useState<Fields | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { ticketTier: CURRENT_PHASE },
  })

  const currentTier = ticketTiers.find((t) => t.id === CURRENT_PHASE)

  const onSubmit = async (data: Fields) => {
    if (!nidFile) { setFileError('NID document is required.'); return }
    setFileError(null)
    setServerError(null)
    setPendingData(data)
    setShowModal(true)
  }

  const handleConfirm = async () => {
    if (!pendingData || !nidFile) return
    setShowModal(false)
    setSubmitting(true)

    const fd = new FormData()
    fd.append('fullName', pendingData.fullName)
    fd.append('phone', pendingData.phone)
    fd.append('nidNumber', pendingData.nidNumber)
    fd.append('ticketTier', pendingData.ticketTier)
    fd.append('nidFile', nidFile)

    const res = await fetch('/api/tickets', { method: 'POST', body: fd })
    const json = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setServerError(json.error ?? 'Something went wrong.')
    } else {
      onSuccess()
    }
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

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    marginBottom: 6,
    fontFamily: 'var(--font-jetbrains-mono)',
  }

  return (
    <>
      {showModal && (
        <InstagramWarningModal
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {currentTier && (
          <div
            className="rounded px-4 py-3 text-sm"
            style={{ background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.2)', color: 'var(--text-muted)' }}
          >
            Adding ticket for <strong style={{ color: 'var(--accent-electric)' }}>{currentTier.label}</strong> — ৳{currentTier.price.toLocaleString()} BDT
          </div>
        )}

        <div>
          <label style={labelStyle}>Full name (as on NID)</label>
          <input {...register('fullName')} style={inputStyle} placeholder="Mohammad Rahman" />
          {errors.fullName && <p className="text-xs mt-1" style={{ color: 'var(--accent-pulse)' }}>{errors.fullName.message}</p>}
        </div>

        <div>
          <label style={labelStyle}>Phone number</label>
          <input {...register('phone')} style={inputStyle} placeholder="+8801XXXXXXXXX" />
          {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--accent-pulse)' }}>{errors.phone.message}</p>}
        </div>

        <div>
          <label style={labelStyle}>NID number</label>
          <input {...register('nidNumber')} style={inputStyle} placeholder="10 or 17 digit NID" />
          {errors.nidNumber && <p className="text-xs mt-1" style={{ color: 'var(--accent-pulse)' }}>{errors.nidNumber.message}</p>}
        </div>

        <input type="hidden" {...register('ticketTier')} />

        <div>
          <label style={labelStyle}>NID document</label>
          <FileUpload
            onChange={(f) => { setNidFile(f); if (f) setFileError(null) }}
            error={fileError ?? undefined}
            label="NID Document"
          />
        </div>

        {serverError && (
          <p className="text-sm rounded px-3 py-2" style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.3)', color: 'var(--accent-pulse)' }}>
            {serverError}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Submitting…' : 'Submit for approval'}
        </Button>
      </form>
    </>
  )
}
