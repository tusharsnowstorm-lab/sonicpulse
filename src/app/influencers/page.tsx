'use client'
import React, { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import FileUpload from '@/components/ui/FileUpload'

const ID_TYPES = [
  { value: 'nid', label: 'National ID (NID)', short: 'NID', docLabel: 'NID Document' },
  { value: 'passport', label: 'Passport', short: 'Passport', docLabel: 'Passport Document' },
  { value: 'birth_certificate', label: 'Birth Certificate', short: 'Birth Cert.', docLabel: 'Birth Certificate' },
]

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'other', label: 'Other' },
]

const FOLLOWER_RANGES = [
  { value: 'under_1k', label: 'Under 1,000' },
  { value: '1k_5k', label: '1,000 – 5,000' },
  { value: '5k_20k', label: '5,000 – 20,000' },
  { value: '20k_100k', label: '20,000 – 100,000' },
  { value: '100k_plus', label: '100,000+' },
]

const CONTENT_TYPES = [
  { value: 'music_nightlife', label: 'Music / Nightlife' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'fashion_beauty', label: 'Fashion & Beauty' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'general', label: 'General Content' },
]

type FormState = {
  full_name: string
  email: string
  phone: string
  id_type: string
  id_number: string
  gender: string
  instagram_handle: string
  tiktok_handle: string
  youtube_channel: string
  primary_platform: string
  follower_count: string
  content_type: string
}

const EMPTY: FormState = {
  full_name: '',
  email: '',
  phone: '',
  id_type: 'nid',
  id_number: '',
  gender: '',
  instagram_handle: '',
  tiktok_handle: '',
  youtube_channel: '',
  primary_platform: 'instagram',
  follower_count: '',
  content_type: '',
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
      <label style={labelStyle}>{label}{required && <span style={{ color: 'var(--accent-magenta)', marginLeft: 3 }}>*</span>}</label>
      {children}
    </div>
  )
}

export default function InfluencersPage() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null)
  const [profilePicError, setProfilePicError] = useState<string | null>(null)
  const [shuttle, setShuttle] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const topRef = useRef<HTMLDivElement>(null)
  const profilePicRef = useRef<HTMLInputElement>(null)

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setProfilePicError('Photo must be JPG, PNG, or WebP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfilePicError('Photo must be under 5MB.')
      return
    }
    setProfilePic(file)
    setProfilePicError(null)
    const reader = new FileReader()
    reader.onload = (ev) => setProfilePicPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const selectedIdType = ID_TYPES.find((t) => t.value === form.id_type) ?? ID_TYPES[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFileError(null)

    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim() || !form.id_number.trim() || !form.gender || !form.instagram_handle.trim() || !form.follower_count || !form.content_type) {
      setError('Please fill in all required fields.')
      return
    }
    if (!profilePic) {
      setProfilePicError('A profile photo is required.')
      return
    }
    if (!idFile) {
      setFileError(`${selectedIdType.docLabel} is required.`)
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('full_name', form.full_name.trim())
      fd.append('email', form.email.trim())
      fd.append('phone', form.phone.trim())
      fd.append('id_type', form.id_type)
      fd.append('id_number', form.id_number.trim())
      fd.append('gender', form.gender)
      fd.append('instagram_handle', form.instagram_handle.trim().replace('@', ''))
      fd.append('tiktok_handle', form.tiktok_handle.trim().replace('@', ''))
      fd.append('youtube_channel', form.youtube_channel.trim())
      fd.append('primary_platform', form.primary_platform)
      fd.append('follower_count', form.follower_count)
      fd.append('content_type', form.content_type)
      fd.append('id_file', idFile)
      if (profilePic) fd.append('profile_pic', profilePic)
      fd.append('shuttle', shuttle ? 'yes' : 'no')

      const res = await fetch('/api/influencers', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed')
      setSubmitted(true)
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg-void)', minHeight: '100svh' }}>
      {/* Minimal top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(5,5,8,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-[640px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/images/logo-badge.webp" alt="Sonic Pulse" width={28} height={28} className="rounded-full" style={{ border: '1.5px solid rgba(255,255,255,0.25)' }} />
            <span className="font-black tracking-[0.15em] text-sm" style={{ fontFamily: 'var(--font-montserrat)', color: 'var(--text-primary)' }}>
              SONIC <span style={{ color: 'var(--accent-magenta)' }}>PULSE</span>
            </span>
          </Link>
          <Link href="/tickets" className="text-xs px-3 py-1.5 rounded" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Get tickets
          </Link>
        </div>
      </div>

      <div ref={topRef} className="max-w-[640px] mx-auto px-4 pt-10 pb-16">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold tracking-[0.12em] uppercase" style={{ background: 'rgba(255,63,194,0.1)', border: '1px solid rgba(255,63,194,0.3)', color: 'var(--accent-magenta)' }}>
            ✦ Media & Influencer Access
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4" style={{ fontFamily: 'var(--font-montserrat)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Cover Sonic <span style={{ color: 'var(--accent-magenta)' }}>Pulse</span>
          </h1>
          <p className="text-sm sm:text-base leading-relaxed max-w-[480px] mx-auto" style={{ color: 'var(--text-muted)' }}>
            We partner with a select group of creators to share the experience. Apply for a complimentary media pass below.
          </p>
        </div>

        {/* Success state */}
        {submitted ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-black mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-montserrat)' }}>Application submitted</h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              We&apos;ve received your application and will review it within 48 hours. If approved, your media pass will be emailed to <strong style={{ color: 'var(--text-primary)' }}>{form.email}</strong>.
            </p>
            <Link href="/" className="inline-block px-6 py-3 rounded-xl text-sm font-bold" style={{ background: 'var(--accent-magenta)', color: '#fff' }}>
              Back to homepage
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* Personal info */}
            <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>Personal Info</p>

              {/* Profile picture */}
              <div>
                <label style={labelStyle}>
                  Profile photo <span style={{ color: 'var(--accent-magenta)', marginLeft: 3 }}>*</span>
                </label>

                {/* Warning banner */}
                <div
                  className="rounded-xl px-4 py-3 mb-4 flex gap-3 items-start"
                  style={{ background: 'rgba(255,63,194,0.06)', border: '1px solid rgba(255,63,194,0.25)' }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>📸</span>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,248,0.75)' }}>
                    Your photo will appear on your media pass and is used for <strong style={{ color: 'var(--text-primary)' }}>identity verification at the gate</strong>. Upload a clear, recent photo of your face. Entry will be refused if your photo does not match your appearance.
                  </p>
                </div>

                {/* Upload zone */}
                <input
                  ref={profilePicRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleProfilePicChange}
                  className="sr-only"
                  aria-label="Upload profile photo"
                />
                <button
                  type="button"
                  onClick={() => profilePicRef.current?.click()}
                  className="w-full rounded-xl transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: profilePicError ? '2px dashed rgba(255,45,107,0.6)' : profilePic ? '2px solid rgba(255,63,194,0.4)' : '2px dashed rgba(255,255,255,0.15)',
                    cursor: 'pointer',
                    padding: 0,
                    overflow: 'hidden',
                    touchAction: 'manipulation',
                  }}
                >
                  {profilePicPreview ? (
                    <div className="flex items-center gap-4 p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profilePicPreview}
                        alt="Profile preview"
                        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,63,194,0.5)', flexShrink: 0 }}
                      />
                      <div className="text-left">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{profilePic?.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--accent-magenta)' }}>Tap to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,63,194,0.08)', border: '2px dashed rgba(255,63,194,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 22 }}>🤳</span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Upload profile photo</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>JPG, PNG or WebP · Max 5MB</p>
                    </div>
                  )}
                </button>
                {profilePicError && (
                  <p className="mt-2 text-xs" style={{ color: '#ff6b8a' }}>{profilePicError}</p>
                )}
              </div>

              <Field label="Full name" required>
                <input style={inputStyle} type="text" autoComplete="name" value={form.full_name} onChange={set('full_name')} placeholder="As it appears on your ID" />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Email address" required>
                  <input style={inputStyle} type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                </Field>
                <Field label="Phone number" required>
                  <input style={inputStyle} type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set('phone')} placeholder="+880 1XXX XXXXXX" />
                </Field>
              </div>

              <Field label="Gender" required>
                <div className="grid grid-cols-2 gap-3">
                  {(['female', 'male'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, gender: g }))}
                      className="py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all"
                      style={{
                        background: form.gender === g ? 'rgba(255,63,194,0.12)' : 'rgba(255,255,255,0.04)',
                        border: form.gender === g ? '2px solid var(--accent-magenta)' : '2px solid rgba(255,255,255,0.1)',
                        color: form.gender === g ? 'var(--accent-magenta)' : 'var(--text-muted)',
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
                      onClick={() => setForm((f) => ({ ...f, id_type: t.value }))}
                      className="py-3 px-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                      style={{
                        background: form.id_type === t.value ? 'rgba(255,63,194,0.12)' : 'rgba(255,255,255,0.04)',
                        border: form.id_type === t.value ? '2px solid var(--accent-magenta)' : '2px solid rgba(255,255,255,0.1)',
                        color: form.id_type === t.value ? 'var(--accent-magenta)' : 'var(--text-muted)',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {t.short}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="ID number" required>
                <input style={inputStyle} type="text" inputMode="numeric" value={form.id_number} onChange={set('id_number')} placeholder={selectedIdType.value === 'nid' ? '10 or 17 digit NID' : selectedIdType.value === 'passport' ? 'Passport number' : 'Certificate number'} />
              </Field>

              <FileUpload
                onChange={(f) => { setIdFile(f); if (f) setFileError(null) }}
                error={fileError ?? undefined}
                label={selectedIdType.docLabel}
              />
            </div>

            {/* Social media */}
            <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>Social Media</p>

              <Field label="Instagram handle" required>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 15, pointerEvents: 'none' }}>@</span>
                  <input style={{ ...inputStyle, paddingLeft: 28 }} type="text" autoCapitalize="none" autoCorrect="off" value={form.instagram_handle} onChange={(e) => setForm((f) => ({ ...f, instagram_handle: e.target.value.replace('@', '') }))} placeholder="yourhandle" />
                </div>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="TikTok handle">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 15, pointerEvents: 'none' }}>@</span>
                    <input style={{ ...inputStyle, paddingLeft: 28 }} type="text" autoCapitalize="none" autoCorrect="off" value={form.tiktok_handle} onChange={(e) => setForm((f) => ({ ...f, tiktok_handle: e.target.value.replace('@', '') }))} placeholder="optional" />
                  </div>
                </Field>
                <Field label="YouTube channel">
                  <input style={inputStyle} type="text" autoCapitalize="none" value={form.youtube_channel} onChange={set('youtube_channel')} placeholder="Channel name (optional)" />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Primary platform" required>
                  <select style={inputStyle} value={form.primary_platform} onChange={set('primary_platform')}>
                    {PLATFORMS.map((p) => <option key={p.value} value={p.value} style={{ background: '#16161F' }}>{p.label}</option>)}
                  </select>
                </Field>
                <Field label="Follower count" required>
                  <select style={{ ...inputStyle, color: form.follower_count ? 'var(--text-primary)' : 'var(--text-muted)' }} value={form.follower_count} onChange={set('follower_count')}>
                    <option value="" disabled style={{ background: '#16161F' }}>Select range</option>
                    {FOLLOWER_RANGES.map((r) => <option key={r.value} value={r.value} style={{ background: '#16161F' }}>{r.label}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Content type" required>
                <select style={{ ...inputStyle, color: form.content_type ? 'var(--text-primary)' : 'var(--text-muted)' }} value={form.content_type} onChange={set('content_type')}>
                  <option value="" disabled style={{ background: '#16161F' }}>Select category</option>
                  {CONTENT_TYPES.map((c) => <option key={c.value} value={c.value} style={{ background: '#16161F' }}>{c.label}</option>)}
                </select>
              </Field>
            </div>

            {/* Shuttle add-on */}
            <button
              type="button"
              onClick={() => setShuttle((s) => !s)}
              className="w-full flex items-start gap-4 rounded-2xl text-left transition-all duration-200 cursor-pointer"
              style={{
                background: shuttle ? 'rgba(255,63,194,0.06)' : 'var(--bg-elevated)',
                border: shuttle ? '1px solid rgba(255,63,194,0.4)' : '1px solid var(--border)',
                padding: '20px',
                touchAction: 'manipulation',
              }}
            >
              <div
                className="shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-all duration-150"
                style={{
                  background: shuttle ? 'var(--accent-magenta)' : 'transparent',
                  border: shuttle ? '2px solid var(--accent-magenta)' : '2px solid rgba(255,255,255,0.2)',
                }}
              >
                {shuttle && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-bold" style={{ color: shuttle ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: 'var(--font-montserrat)' }}>
                    🚌 Add shuttle transport
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--accent-magenta)', fontFamily: 'var(--font-montserrat)' }}>
                    +৳800
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Round-trip shuttle service to and from the venue. Pickup point and schedule will be emailed closer to the event.
                </p>
              </div>
            </button>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.3)', color: '#ff6b8a' }}>
                {error}
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
              }}
            >
              {submitting ? 'Submitting…' : 'Submit application →'}
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              By submitting you agree that your details will be used to verify your identity at the gate.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
