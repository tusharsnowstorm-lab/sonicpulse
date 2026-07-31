'use client'
import { useState } from 'react'
import PillButton from '@/components/ui/PillButton'

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 14,
  color: '#fff',
  fontFamily: 'var(--font-montserrat)',
  WebkitAppearance: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--text-label-muted)',
  fontWeight: 700,
  marginBottom: 6,
}

type Status = 'idle' | 'submitting' | 'success' | 'not_open' | 'already_applied' | 'error'

const initialForm = {
  fullName: '',
  email: '',
  stageName: '',
  cityCountry: '',
  genres: '',
  bio: '',
  mixLink: '',
  instagramHandle: '',
  yearsExperience: '',
  notes: '',
}

export default function FirstPulseForm() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [referenceCode, setReferenceCode] = useState('')

  const set = (key: keyof typeof initialForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/first-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json().catch(() => ({}))
      if (res.status === 503 && json.error === 'not_open') {
        setStatus('not_open')
        return
      }
      if (res.status === 409) {
        setStatus('already_applied')
        return
      }
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Something went wrong on our end. Try again in a minute, or email your application to hello@sonicpulsefestival.com.')
        setStatus('error')
        return
      }
      setReferenceCode(json.referenceCode ?? '')
      setStatus('success')
    } catch {
      setErrorMsg('Something went wrong on our end. Try again in a minute, or email your application to hello@sonicpulsefestival.com.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--accent-soft)', borderRadius: 'var(--radius-card)', padding: 32, textAlign: 'center' }}
        aria-live="polite"
      >
        <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Signal sent.</p>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 20 }}>
          We&apos;ll be in touch. Selected names are announced on the event page.
        </p>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-label-muted)', marginBottom: 6 }}>
          Reference code
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 20, color: 'var(--accent-magenta)', fontWeight: 700 }}>{referenceCode}</p>
      </div>
    )
  }

  if (status === 'not_open') {
    return (
      <div
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: 32, textAlign: 'center' }}
      >
        <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Applications open soon.</p>
        <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>Check back shortly, or follow @sonicpulsefestival for the announcement.</p>
      </div>
    )
  }

  if (status === 'already_applied') {
    return (
      <div
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: 32, textAlign: 'center' }}
      >
        <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>You&apos;ve already applied.</p>
        <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>The application we have on file is the one that counts. Questions? Email hello@sonicpulsefestival.com.</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: 30, display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <p style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-label-muted)', fontWeight: 700 }}>
        Register for First Pulse
      </p>

      <div>
        <label style={labelStyle} htmlFor="fp-name">Full name <em style={{ color: 'var(--accent-magenta)', fontStyle: 'normal' }}>*</em></label>
        <input id="fp-name" style={fieldStyle} required value={form.fullName} onChange={set('fullName')} placeholder="Your legal name" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="fp-email">Email <em style={{ color: 'var(--accent-magenta)', fontStyle: 'normal' }}>*</em></label>
        <input id="fp-email" type="email" style={fieldStyle} required value={form.email} onChange={set('email')} placeholder="you@example.com" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="fp-stage">Stage name <em style={{ color: 'var(--accent-magenta)', fontStyle: 'normal' }}>*</em></label>
        <input id="fp-stage" style={fieldStyle} required value={form.stageName} onChange={set('stageName')} placeholder="What goes on the poster" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="fp-city">City & country <em style={{ color: 'var(--accent-magenta)', fontStyle: 'normal' }}>*</em></label>
        <input id="fp-city" style={fieldStyle} required value={form.cityCountry} onChange={set('cityCountry')} placeholder="Dhaka, Bangladesh / anywhere" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="fp-genres">Sound & genres <em style={{ color: 'var(--accent-magenta)', fontStyle: 'normal' }}>*</em></label>
        <input id="fp-genres" style={fieldStyle} required value={form.genres} onChange={set('genres')} placeholder="e.g. melodic techno, psytrance, organic house" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="fp-bio">
          Bio <em style={{ color: 'var(--accent-magenta)', fontStyle: 'normal' }}>*</em>
          <span style={{ float: 'right', textTransform: 'none', fontWeight: 400, color: form.bio.length > 1000 ? '#e24b4a' : 'var(--text-label-muted)' }}>
            {form.bio.length}/1000
          </span>
        </label>
        <textarea id="fp-bio" style={{ ...fieldStyle, minHeight: 90, resize: 'vertical' }} required maxLength={1000} value={form.bio} onChange={set('bio')} placeholder="Who are you behind the decks?" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="fp-mix">Example set / mix link</label>
        <input id="fp-mix" type="text" inputMode="url" style={fieldStyle} value={form.mixLink} onChange={set('mixLink')} placeholder="SoundCloud, Mixcloud, YouTube — optional but decisive" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="fp-ig">Instagram / socials</label>
        <input id="fp-ig" style={fieldStyle} value={form.instagramHandle} onChange={set('instagramHandle')} placeholder="@yourhandle" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="fp-years">Years behind the decks</label>
        <input id="fp-years" type="number" min={0} max={60} style={fieldStyle} value={form.yearsExperience} onChange={set('yearsExperience')} placeholder="0 is a valid answer" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="fp-notes">Anything else</label>
        <textarea id="fp-notes" style={{ ...fieldStyle, minHeight: 70, resize: 'vertical' }} value={form.notes} onChange={set('notes')} placeholder="Gear needs, b2b partner, the thing you'd play at 4 AM" />
      </div>

      {status === 'error' && (
        <p style={{ fontSize: 13, color: '#e24b4a' }} aria-live="polite">{errorMsg}</p>
      )}

      <PillButton type="submit" disabled={status === 'submitting'} style={{ width: '100%', marginTop: 6 }}>
        {status === 'submitting' ? 'Sending…' : 'Send your First Pulse →'}
      </PillButton>

      <p style={{ fontSize: 11.5, color: 'var(--text-label-muted)', textAlign: 'center' }}>
        Stored securely · reviewed by the Sonic Pulse artists
      </p>
    </form>
  )
}
