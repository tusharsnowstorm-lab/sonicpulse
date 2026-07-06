'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, User, Users } from 'lucide-react'
import FileUpload from '@/components/ui/FileUpload'
import Button from '@/components/ui/Button'
import { CURRENT_PHASE, ticketTiers } from '@/data/tickets'

type IdType = 'nid' | 'passport' | 'birth_certificate'

const ID_TYPE_OPTIONS: { value: IdType; label: string; short: string; placeholder: string; docLabel: string }[] = [
  { value: 'nid',               label: 'National ID (NID)',  short: 'NID',              placeholder: '10 or 17 digit NID',         docLabel: 'NID Document' },
  { value: 'passport',          label: 'Passport',           short: 'Passport',         placeholder: 'e.g. AB1234567',             docLabel: 'Passport Document' },
  { value: 'birth_certificate', label: 'Birth Certificate',  short: 'Birth Certificate', placeholder: '17-digit certificate number', docLabel: 'Birth Certificate Document' },
]

const schema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phone: z.string().regex(/^(\+?880|0)1[3-9]\d{8}$/, 'Enter a valid Bangladesh phone number'),
  idNumber: z.string().min(3, 'ID number required'),
  instagramHandle: z.string().min(1, 'Instagram handle is required'),
  gender: z.enum(['male', 'female'], { error: 'Please select a gender' }),
  ticketTier: z.enum(['phase1', 'phase2', 'phase3']),
})

type Fields = z.infer<typeof schema>

type Profile = {
  full_name?: string
  phone?: string
  nid_number?: string
  nid_file_path?: string
  instagram_handle?: string
  gender?: string
  id_type?: string
}

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
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(204,255,0,0.05)' }}
        >
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-volt)' }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            <span className="font-bold text-sm" style={{ color: 'var(--accent-volt)', fontFamily: 'var(--font-space-grotesk)' }}>
              Important — Before you submit
            </span>
          </div>
          <button type="button" onClick={onCancel} className="p-1 rounded cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

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
            <p className="text-base font-bold tracking-wide" style={{ color: 'var(--accent-volt)', fontFamily: 'var(--font-jetbrains-mono)' }}>
              @dhakamusicfestival
            </p>
            <p style={{ color: 'rgba(240,240,248,0.65)' }}>
              You <strong style={{ color: 'var(--text-primary)' }}>must accept</strong> this follow request for your ticket to be approved. Ignoring it will result in your ticket not being verified.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none" style={{ touchAction: 'manipulation' }}>
            <div className="relative mt-0.5 shrink-0">
              <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="sr-only" />
              <div
                className="w-5 h-5 rounded flex items-center justify-center transition-colors"
                style={{
                  background: checked ? 'var(--accent-magenta)' : 'var(--bg-surface)',
                  border: checked ? '2px solid var(--accent-magenta)' : '2px solid var(--border)',
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

        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-3 rounded text-sm cursor-pointer"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!checked}
            className="w-full sm:flex-1 px-4 py-3 rounded text-sm font-bold transition-all"
            style={{
              background: checked ? 'var(--accent-magenta)' : 'rgba(255,63,194,0.15)',
              color: checked ? '#050508' : 'rgba(255,63,194,0.35)',
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
  const [forMyself, setForMyself] = useState<boolean | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileMissing, setProfileMissing] = useState(false)

  const [idType, setIdType] = useState<IdType>('nid')
  const [nidFile, setNidFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [pendingData, setPendingData] = useState<(Fields & { idType: IdType }) | null>(null)

  const currentTier = ticketTiers.find((t) => t.id === CURRENT_PHASE)
  const selectedIdOption = ID_TYPE_OPTIONS.find((o) => o.value === idType) ?? ID_TYPE_OPTIONS[0]

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then(({ profile }) => {
        setProfile(profile)
        setProfileLoading(false)
      })
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { ticketTier: CURRENT_PHASE },
  })

  const onSubmit = async (data: Fields) => {
    if (!nidFile) { setFileError(`${selectedIdOption.docLabel} is required.`); return }
    setFileError(null)
    setServerError(null)
    setPendingData({ ...data, idType })
    setShowModal(true)
  }

  const handleMyselfSubmit = async () => {
    if (!profile) return
    const missing = !profile.full_name || !profile.phone || !profile.nid_number || !profile.nid_file_path || !profile.instagram_handle || !profile.gender
    if (missing) { setProfileMissing(true); return }
    setProfileMissing(false)
    setPendingData({
      fullName: profile.full_name!,
      phone: profile.phone!,
      idNumber: profile.nid_number!,
      instagramHandle: profile.instagram_handle!,
      gender: profile.gender as 'male' | 'female',
      ticketTier: CURRENT_PHASE,
      idType: (profile.id_type as IdType) ?? 'nid',
    })
    setShowModal(true)
  }

  const handleConfirm = async () => {
    if (!pendingData) return
    setShowModal(false)
    setSubmitting(true)

    const fd = new FormData()
    fd.append('fullName', pendingData.fullName)
    fd.append('phone', pendingData.phone)
    fd.append('idNumber', pendingData.idNumber)
    fd.append('idType', pendingData.idType)
    fd.append('instagramHandle', pendingData.instagramHandle)
    fd.append('gender', pendingData.gender)
    fd.append('ticketTier', pendingData.ticketTier)

    if (forMyself && profile?.nid_file_path) {
      fd.append('nidFilePath', profile.nid_file_path)
    } else if (nidFile) {
      fd.append('nidFile', nidFile)
    }

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
    fontSize: 16,
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

  const profileIdOption = ID_TYPE_OPTIONS.find((o) => o.value === (profile?.id_type ?? 'nid')) ?? ID_TYPE_OPTIONS[0]

  return (
    <>
      {showModal && <InstagramWarningModal onConfirm={handleConfirm} onCancel={() => setShowModal(false)} />}

      <div className="space-y-5">
        {currentTier && (
          <div
            className="rounded px-4 py-3 text-sm"
            style={{ background: 'rgba(255,63,194,0.06)', border: '1px solid rgba(255,63,194,0.2)', color: 'var(--text-muted)' }}
          >
            Adding ticket for <strong style={{ color: 'var(--accent-magenta)' }}>{currentTier.label}</strong> — ৳{currentTier.price.toLocaleString()} BDT
          </div>
        )}

        {/* Who is this for? */}
        <div>
          <p style={labelStyle}>Who is this ticket for?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setForMyself(true); setProfileMissing(false) }}
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all cursor-pointer"
              style={{
                background: forMyself === true ? 'rgba(255,63,194,0.12)' : 'var(--bg-surface)',
                border: forMyself === true ? '2px solid var(--accent-magenta)' : '2px solid var(--border)',
                color: forMyself === true ? 'var(--accent-magenta)' : 'var(--text-muted)',
              }}
            >
              <User size={15} />
              For myself
            </button>
            <button
              type="button"
              onClick={() => { setForMyself(false); setProfileMissing(false) }}
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all cursor-pointer"
              style={{
                background: forMyself === false ? 'rgba(255,63,194,0.12)' : 'var(--bg-surface)',
                border: forMyself === false ? '2px solid var(--accent-magenta)' : '2px solid var(--border)',
                color: forMyself === false ? 'var(--accent-magenta)' : 'var(--text-muted)',
              }}
            >
              <Users size={15} />
              For someone else
            </button>
          </div>
        </div>

        {/* For myself flow */}
        {forMyself === true && (
          <div className="space-y-4">
            {profileLoading ? (
              <div className="h-20 rounded animate-pulse" style={{ background: 'var(--bg-surface)' }} />
            ) : profile?.full_name ? (
              <div
                className="rounded-lg p-4 space-y-2"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 2 }}>Name</p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{profile.full_name}</p>
                  </div>
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 2 }}>Phone</p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{profile.phone}</p>
                  </div>
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 2 }}>{profileIdOption.short}</p>
                    <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                      {profile.nid_number?.slice(0, 4)}••••••
                    </p>
                  </div>
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 2 }}>{profileIdOption.docLabel}</p>
                    <p className="text-sm" style={{ color: profile.nid_file_path ? '#22c55e' : 'var(--accent-pulse)' }}>
                      {profile.nid_file_path ? '✓ On file' : '✗ Missing'}
                    </p>
                  </div>
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 2 }}>Instagram</p>
                    <p className="text-sm" style={{ color: profile.instagram_handle ? 'var(--text-primary)' : 'var(--accent-pulse)' }}>
                      {profile.instagram_handle ? `@${profile.instagram_handle}` : '✗ Missing'}
                    </p>
                  </div>
                </div>
                <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                  Update this in the <strong>My Information</strong> section above.
                </p>
              </div>
            ) : (
              <div
                className="rounded-lg p-4 text-sm"
                style={{ background: 'rgba(255,45,107,0.08)', border: '1px solid rgba(255,45,107,0.25)', color: 'var(--accent-pulse)' }}
              >
                Your personal information is not saved yet. Please fill in the <strong>My Information</strong> section above first, then come back to add a ticket.
              </div>
            )}

            {profileMissing && (
              <p className="text-sm" style={{ color: 'var(--accent-pulse)' }}>
                Your saved information is incomplete. Please update <strong>My Information</strong> above with all fields including your ID document.
              </p>
            )}

            {serverError && (
              <p className="text-sm rounded px-3 py-2" style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.3)', color: 'var(--accent-pulse)' }}>
                {serverError}
              </p>
            )}

            {profile?.full_name && (
              <Button onClick={handleMyselfSubmit} disabled={submitting} className="w-full">
                {submitting ? 'Submitting…' : 'Submit for approval'}
              </Button>
            )}
          </div>
        )}

        {/* For someone else flow */}
        {forMyself === false && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label style={labelStyle}>Full name (as on ID document)</label>
              <input {...register('fullName')} style={inputStyle} placeholder="Mohammad Rahman" />
              {errors.fullName && <p className="text-xs mt-1" style={{ color: 'var(--accent-pulse)' }}>{errors.fullName.message}</p>}
            </div>

            <div>
              <label style={labelStyle}>Phone number</label>
              <input {...register('phone')} style={inputStyle} placeholder="+8801XXXXXXXXX" />
              {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--accent-pulse)' }}>{errors.phone.message}</p>}
            </div>

            {/* ID type selector */}
            <div>
              <label style={labelStyle}>ID document type</label>
              <div className="grid grid-cols-3 gap-2">
                {ID_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIdType(opt.value)}
                    className="py-2.5 px-2 rounded text-xs font-semibold transition-all cursor-pointer"
                    style={{
                      background: idType === opt.value ? 'rgba(255,63,194,0.12)' : 'var(--bg-surface)',
                      border: idType === opt.value ? '2px solid var(--accent-magenta)' : '2px solid var(--border)',
                      color: idType === opt.value ? 'var(--accent-magenta)' : 'var(--text-muted)',
                    }}
                  >
                    {opt.short}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label style={labelStyle}>{selectedIdOption.short} number</label>
                <input {...register('idNumber')} style={inputStyle} placeholder={selectedIdOption.placeholder} />
                {errors.idNumber && <p className="text-xs mt-1" style={{ color: 'var(--accent-pulse)' }}>{errors.idNumber.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Instagram handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>@</span>
                  <input {...register('instagramHandle')} style={{ ...inputStyle, paddingLeft: 28 }} placeholder="theirhandle" />
                </div>
                {errors.instagramHandle && <p className="text-xs mt-1" style={{ color: 'var(--accent-pulse)' }}>{errors.instagramHandle.message}</p>}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Gender</label>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female'] as const).map((g) => (
                  <label
                    key={g}
                    className="flex items-center justify-center py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '2px solid var(--border)',
                    }}
                  >
                    <input type="radio" value={g} {...register('gender')} className="sr-only" />
                    <span>{g.charAt(0).toUpperCase() + g.slice(1)}</span>
                  </label>
                ))}
              </div>
              {errors.gender && <p className="text-xs mt-1" style={{ color: 'var(--accent-pulse)' }}>{errors.gender.message}</p>}
            </div>

            <input type="hidden" {...register('ticketTier')} />

            <div>
              <label style={labelStyle}>{selectedIdOption.docLabel}</label>
              <FileUpload
                onChange={(f) => { setNidFile(f); if (f) setFileError(null) }}
                error={fileError ?? undefined}
                label={selectedIdOption.docLabel}
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
        )}
      </div>
    </>
  )
}
