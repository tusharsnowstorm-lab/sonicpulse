'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

export default function AddTicketForm({ onSuccess }: { onSuccess: () => void }) {
  const [nidFile, setNidFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

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
    setSubmitting(true)

    const fd = new FormData()
    fd.append('fullName', data.fullName)
    fd.append('phone', data.phone)
    fd.append('nidNumber', data.nidNumber)
    fd.append('ticketTier', data.ticketTier)
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
  )
}
