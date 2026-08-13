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
  phone: '',
  institution: '',
  level: '',
  graduationYear: '',
  dateOfBirth: '',
  shiftPreference: '',
  motivation: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  instagramHandle: '',
  notes: '',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: 32,
  textAlign: 'center',
}

const Required = () => <em style={{ color: 'var(--accent-magenta)', fontStyle: 'normal' }}>*</em>

export default function WayfinderForm() {
  const [form, setForm] = useState(initialForm)
  const [stayToClose, setStayToClose] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [referenceCode, setReferenceCode] = useState('')

  const set = (key: keyof typeof initialForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const dob = new Date(form.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    const isAtLeast17 = age > 17 || (age === 17 && (m > 0 || (m === 0 && today.getDate() >= dob.getDate())))
    if (!isAtLeast17) {
      setErrorMsg('Wayfinders must be 17 or older to apply.')
      setStatus('error')
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch('/api/wayfinder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, stayToClose }),
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
      <div style={{ ...cardStyle, border: '1px solid var(--accent-soft)' }} aria-live="polite">
        <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>You&apos;re on the list.</p>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 20 }}>
          We&apos;ll confirm your shift and briefing details closer to the event.
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
      <div style={cardStyle}>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Applications open soon.</p>
        <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>Check back shortly, or follow @sonicpulsefestival for the announcement.</p>
      </div>
    )
  }

  if (status === 'already_applied') {
    return (
      <div style={cardStyle}>
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
        Apply to be a Wayfinder
      </p>

      <div>
        <label style={labelStyle} htmlFor="wf-name">Full name <Required /></label>
        <input id="wf-name" style={fieldStyle} required value={form.fullName} onChange={set('fullName')} placeholder="Your full name" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="wf-email">Email <Required /></label>
        <input id="wf-email" type="email" style={fieldStyle} required value={form.email} onChange={set('email')} placeholder="you@example.com" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="wf-phone">Phone <Required /></label>
        <input id="wf-phone" inputMode="tel" style={fieldStyle} required value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="wf-institution">School / college / university <Required /></label>
        <input id="wf-institution" style={fieldStyle} required value={form.institution} onChange={set('institution')} placeholder="Where you study" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="wf-level">Where you are in your studies <Required /></label>
        <select id="wf-level" style={fieldStyle} required value={form.level} onChange={set('level')}>
          <option value="">Select one</option>
          <option value="undergraduate_final">Final-year undergraduate</option>
          <option value="hsc_alevel">HSC / A-level finisher</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label style={labelStyle} htmlFor="wf-gradyear">Expected graduation year</label>
        <input id="wf-gradyear" type="number" min={2026} max={2032} style={fieldStyle} value={form.graduationYear} onChange={set('graduationYear')} placeholder="2027" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="wf-dob">Date of birth <Required /></label>
        <input id="wf-dob" type="date" style={fieldStyle} required value={form.dateOfBirth} onChange={set('dateOfBirth')} />
      </div>

      <div>
        <label style={labelStyle} htmlFor="wf-shift">Shift preference <Required /></label>
        <select id="wf-shift" style={fieldStyle} required value={form.shiftPreference} onChange={set('shiftPreference')}>
          <option value="">Select one</option>
          <option value="dusk">Shift A · Dusk — 3:00 PM to 11:00 PM</option>
          <option value="dawn">Shift B · Dawn — 11:00 PM to 7:00 AM</option>
          <option value="either">Either shift works</option>
        </select>
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={stayToClose}
          onChange={(e) => setStayToClose(e.target.checked)}
          style={{ marginTop: 3, accentColor: 'var(--accent-magenta)', width: 16, height: 16, touchAction: 'manipulation' }}
        />
        I can stay to the close (7:00–9:30 AM)
      </label>

      <div>
        <label style={labelStyle} htmlFor="wf-motivation">
          Why you want to do this
          <span style={{ float: 'right', textTransform: 'none', fontWeight: 400, color: form.motivation.length > 600 ? '#e24b4a' : 'var(--text-label-muted)' }}>
            {form.motivation.length}/600
          </span>
        </label>
        <textarea id="wf-motivation" style={{ ...fieldStyle, minHeight: 90, resize: 'vertical' }} maxLength={600} value={form.motivation} onChange={set('motivation')} placeholder="A few lines is plenty" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="wf-ec-name">Emergency contact name <Required /></label>
        <input id="wf-ec-name" style={fieldStyle} required value={form.emergencyContactName} onChange={set('emergencyContactName')} placeholder="Parent, guardian, or next of kin" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="wf-ec-phone">Emergency contact phone <Required /></label>
        <input id="wf-ec-phone" inputMode="tel" style={fieldStyle} required value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} placeholder="01XXXXXXXXX" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="wf-ig">Instagram / socials</label>
        <input id="wf-ig" style={fieldStyle} value={form.instagramHandle} onChange={set('instagramHandle')} placeholder="@yourhandle" />
      </div>

      <div>
        <label style={labelStyle} htmlFor="wf-notes">Anything we should know</label>
        <textarea id="wf-notes" style={{ ...fieldStyle, minHeight: 70, resize: 'vertical' }} value={form.notes} onChange={set('notes')} placeholder="Accessibility needs, medical notes, anything else" />
      </div>

      {status === 'error' && (
        <p style={{ fontSize: 13, color: '#e24b4a' }} aria-live="polite">{errorMsg}</p>
      )}

      <PillButton type="submit" disabled={status === 'submitting'} style={{ width: '100%', marginTop: 6 }}>
        {status === 'submitting' ? 'Sending…' : 'Apply to be a Wayfinder →'}
      </PillButton>

      <p style={{ fontSize: 11.5, color: 'var(--text-label-muted)', textAlign: 'center' }}>
        Certificates are issued by Dhaka Music Festival on completion of your shift.
      </p>
    </form>
  )
}
