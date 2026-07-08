'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import FileUpload from '@/components/ui/FileUpload'

const ID_TYPES = [
  { value: 'nid',               short: 'NID',        placeholder: '10 or 17 digit NID',          docLabel: 'NID Document' },
  { value: 'passport',          short: 'Passport',   placeholder: 'Passport number',              docLabel: 'Passport Document' },
  { value: 'birth_certificate', short: 'Birth Cert', placeholder: '17-digit certificate number',  docLabel: 'Birth Certificate' },
]

type IdType = 'nid' | 'passport' | 'birth_certificate'

type Application = {
  id: string
  status: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  padding: '12px 14px',
  color: 'var(--text-primary)',
  fontSize: '15px',
  fontFamily: 'var(--font-montserrat)',
  outline: 'none',
  WebkitAppearance: 'none',
  appearance: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '6px',
  fontFamily: 'var(--font-montserrat)',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: 'var(--accent-magenta)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export default function InfluencerTransferPage() {
  // Step 1: email lookup
  const [email, setEmail] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [application, setApplication] = useState<Application | null>(null)

  // Step 2: transfer form
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [nidNumber, setNidNumber] = useState('')
  const [idType, setIdType] = useState<IdType>('nid')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [gender, setGender] = useState('')
  const [nidFile, setNidFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedIdType = ID_TYPES.find((t) => t.value === idType) ?? ID_TYPES[0]

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLookupError('')
    setLookupLoading(true)
    try {
      const res = await fetch('/api/influencers/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Not found')
      setApplication(json.application)
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLookupLoading(false)
    }
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!application) return
    setFormError('')
    setFileError(null)

    if (!fullName || !phone || !nidNumber || !instagramHandle || !gender) {
      setFormError('Please fill in all required fields.')
      return
    }
    if (!nidFile) {
      setFileError(`${selectedIdType.docLabel} is required.`)
      return
    }
    if (!confirmed) {
      setFormError('Please confirm the transfer.')
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('applicationId', application.id)
      fd.append('currentEmail', email)
      fd.append('fullName', fullName)
      fd.append('phone', phone)
      fd.append('nidNumber', nidNumber)
      fd.append('idType', idType)
      fd.append('instagramHandle', instagramHandle.replace(/^@/, ''))
      fd.append('gender', gender)
      fd.append('nidFile', nidFile)

      const res = await fetch('/api/influencers/transfer', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Transfer failed')
      setSuccess(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg-void)', minHeight: '100svh' }}>
      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(5,5,8,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-[640px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/images/logo-badge.webp" alt="Sonic Pulse" width={28} height={28} className="rounded-full" style={{ border: '1.5px solid rgba(255,255,255,0.25)' }} />
            <span className="font-black tracking-[0.15em] text-sm" style={{ fontFamily: 'var(--font-montserrat)', color: 'var(--text-primary)' }}>
              SONIC <span style={{ color: 'var(--accent-magenta)' }}>PULSE</span>
            </span>
          </Link>
          <Link href="/influencers" className="text-xs px-3 py-1.5 rounded" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', fontFamily: 'var(--font-montserrat)' }}>
            Media pass
          </Link>
        </div>
      </div>

      <div className="max-w-[640px] mx-auto px-4 pt-10 pb-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold tracking-[0.12em] uppercase" style={{ background: 'rgba(255,63,194,0.1)', border: '1px solid rgba(255,63,194,0.3)', color: 'var(--accent-magenta)' }}>
            ↔ Transfer Media Pass
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-4" style={{ fontFamily: 'var(--font-montserrat)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Transfer Your <span style={{ color: 'var(--accent-magenta)' }}>Pass</span>
          </h1>
          <p className="text-sm leading-relaxed max-w-[440px] mx-auto" style={{ color: 'var(--text-muted)' }}>
            Transfer your media pass to another person. They will go through the same approval process and their details will replace yours.
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-black mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-montserrat)' }}>Transfer submitted</h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              The new holder&apos;s details have been submitted. Their application will go through the approval process. Your pass slot is preserved.
            </p>
            <Link href="/" className="inline-block px-6 py-3 rounded-xl text-sm font-bold" style={{ background: 'var(--accent-magenta)', color: '#fff', fontFamily: 'var(--font-montserrat)' }}>
              Back to homepage
            </Link>
          </div>
        ) : !application ? (
          /* Step 1: email lookup */
          <form onSubmit={handleLookup} className="space-y-5">
            <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>Find your application</p>
              <Field label="Email address you applied with" required>
                <input
                  style={inputStyle}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
              {lookupError && (
                <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.3)', color: '#ff6b8a' }}>
                  {lookupError}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={lookupLoading || !email}
              className="w-full py-4 rounded-xl font-black text-base tracking-[0.05em]"
              style={{
                background: lookupLoading || !email ? 'rgba(255,63,194,0.4)' : 'var(--accent-magenta)',
                color: '#fff',
                fontFamily: 'var(--font-montserrat)',
                cursor: lookupLoading || !email ? 'not-allowed' : 'pointer',
                border: 'none',
                touchAction: 'manipulation',
              }}
            >
              {lookupLoading ? 'Looking up…' : 'Continue →'}
            </button>
          </form>
        ) : (
          /* Step 2: transfer form */
          <form onSubmit={handleTransfer} className="space-y-6" noValidate>
            {/* Found application notice */}
            <div className="rounded-2xl px-5 py-4 flex items-center gap-4" style={{ background: 'rgba(255,63,194,0.06)', border: '1px solid rgba(255,63,194,0.25)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,63,194,0.12)', border: '2px solid rgba(255,63,194,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                🎤
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-montserrat)' }}>Application found</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Status: {application.status}</p>
              </div>
              <button type="button" onClick={() => setApplication(null)} className="ml-auto text-xs cursor-pointer" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-montserrat)', touchAction: 'manipulation' }}>
                Change
              </button>
            </div>

            {/* Warning */}
            <div className="rounded-xl px-4 py-3 text-xs leading-relaxed" style={{ background: 'rgba(255,63,194,0.06)', border: '1px solid rgba(255,63,194,0.2)', color: 'rgba(240,240,248,0.75)' }}>
              The new holder&apos;s details will go through the approval process. Your pass slot is preserved while they are reviewed.
            </div>

            {/* New holder details */}
            <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>New holder details</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Full name (as on ID)" required>
                  <input style={inputStyle} type="text" autoComplete="off" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Mohammad Rahman" />
                </Field>
                <Field label="Phone number" required>
                  <input style={inputStyle} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1XXX XXXXXX" />
                </Field>
              </div>

              <Field label="Gender" required>
                <div className="grid grid-cols-3 gap-3">
                  {(['female', 'male', 'non-binary'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className="py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all"
                      style={{
                        background: gender === g ? 'rgba(255,63,194,0.12)' : 'rgba(255,255,255,0.04)',
                        border: gender === g ? '2px solid var(--accent-magenta)' : '2px solid rgba(255,255,255,0.1)',
                        color: gender === g ? 'var(--accent-magenta)' : 'var(--text-muted)',
                        touchAction: 'manipulation',
                      }}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="ID type" required>
                <div className="grid grid-cols-3 gap-2">
                  {ID_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setIdType(t.value as IdType)}
                      className="py-3 px-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                      style={{
                        background: idType === t.value ? 'rgba(255,63,194,0.12)' : 'rgba(255,255,255,0.04)',
                        border: idType === t.value ? '2px solid var(--accent-magenta)' : '2px solid rgba(255,255,255,0.1)',
                        color: idType === t.value ? 'var(--accent-magenta)' : 'var(--text-muted)',
                        letterSpacing: '0.03em',
                        touchAction: 'manipulation',
                      }}
                    >
                      {t.short}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={`${selectedIdType.short} number`} required>
                <input style={inputStyle} type="text" inputMode="numeric" value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} placeholder={selectedIdType.placeholder} />
              </Field>

              <Field label="Instagram handle" required>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 15, pointerEvents: 'none' }}>@</span>
                  <input style={{ ...inputStyle, paddingLeft: 28 }} type="text" autoCapitalize="none" autoCorrect="off" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value.replace('@', ''))} placeholder="theirhandle" />
                </div>
              </Field>

              <FileUpload
                onChange={(f) => { setNidFile(f); if (f) setFileError(null) }}
                error={fileError ?? undefined}
                label={selectedIdType.docLabel}
              />
            </div>

            {/* Confirmation checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none" style={{ touchAction: 'manipulation' }}>
              <div className="relative mt-0.5 shrink-0">
                <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="sr-only" />
                <div
                  className="w-5 h-5 rounded flex items-center justify-center transition-colors"
                  style={{
                    background: confirmed ? 'var(--accent-magenta)' : 'rgba(255,255,255,0.05)',
                    border: confirmed ? '2px solid var(--accent-magenta)' : '2px solid rgba(255,255,255,0.15)',
                  }}
                >
                  {confirmed && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4L4 7L10 1" stroke="#050508" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,248,0.7)', fontFamily: 'var(--font-montserrat)' }}>
                I confirm I want to transfer my media pass to this person. This cannot be undone once approved.
              </span>
            </label>

            {formError && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.3)', color: '#ff6b8a' }}>
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl font-black text-base tracking-[0.05em]"
              style={{
                background: submitting ? 'rgba(255,63,194,0.4)' : 'var(--accent-magenta)',
                color: '#fff',
                fontFamily: 'var(--font-montserrat)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                border: 'none',
                touchAction: 'manipulation',
              }}
            >
              {submitting ? 'Transferring…' : 'Transfer media pass →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
