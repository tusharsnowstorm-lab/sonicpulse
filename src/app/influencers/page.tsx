'use client'
import React, { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const ID_TYPES = [
  { value: 'nid', label: 'National ID (NID)' },
  { value: 'passport', label: 'Passport' },
  { value: 'birth_certificate', label: 'Birth Certificate' },
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
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const topRef = useRef<HTMLDivElement>(null)

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim() || !form.id_number.trim() || !form.instagram_handle.trim() || !form.follower_count || !form.content_type) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
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
            We partner with a select group of creators to share the experience. If you cover music, nightlife, or culture — apply for a complimentary media pass.
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
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-xl text-sm font-bold"
              style={{ background: 'var(--accent-magenta)', color: '#fff' }}
            >
              Back to homepage
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Personal info */}
            <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>Personal Info</p>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="ID type" required>
                  <select style={inputStyle} value={form.id_type} onChange={set('id_type')}>
                    {ID_TYPES.map((t) => <option key={t.value} value={t.value} style={{ background: '#16161F' }}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="ID number" required>
                  <input style={inputStyle} type="text" inputMode="numeric" value={form.id_number} onChange={set('id_number')} placeholder="Your ID number" />
                </Field>
              </div>
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
