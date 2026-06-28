'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  subject: z.enum(['general', 'ticket', 'press', 'vendor', 'other']),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

type FormData = z.infer<typeof schema>

const inputClass = `
  w-full px-4 py-3 rounded-[4px] text-sm
  bg-[var(--bg-elevated)] border border-[var(--border)]
  text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-electric)]
  transition-colors duration-150 placeholder:text-[var(--text-muted)]
`

export default function ContactForm() {
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { subject: 'general' },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitState('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setSubmitState('success')
    } catch {
      setSubmitState('error')
    }
  }

  if (submitState === 'success') {
    return (
      <div
        className="p-8 rounded-[4px] text-center"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent-electric)' }}
        aria-live="polite"
      >
        <p
          className="text-xl font-black mb-2"
          style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--accent-electric)' }}
        >
          Message sent.
        </p>
        <p className="text-sm text-[var(--text-muted)]">We'll get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Name <span style={{ color: 'var(--accent-pulse)' }}>*</span>
          </label>
          <input {...register('name')} type="text" placeholder="Your name" className={inputClass} style={errors.name ? { borderColor: 'var(--accent-pulse)' } : {}} />
          {errors.name && <p className="mt-1 text-xs" style={{ color: 'var(--accent-pulse)' }}>{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Email <span style={{ color: 'var(--accent-pulse)' }}>*</span>
          </label>
          <input {...register('email')} type="email" placeholder="you@example.com" className={inputClass} style={errors.email ? { borderColor: 'var(--accent-pulse)' } : {}} />
          {errors.email && <p className="mt-1 text-xs" style={{ color: 'var(--accent-pulse)' }}>{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          Subject <span style={{ color: 'var(--accent-pulse)' }}>*</span>
        </label>
        <select
          {...register('subject')}
          className={inputClass}
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
        >
          <option value="general">General Inquiry</option>
          <option value="ticket">Ticket Issue</option>
          <option value="press">Press / Media</option>
          <option value="vendor">Vendor</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          Message <span style={{ color: 'var(--accent-pulse)' }}>*</span>
        </label>
        <textarea
          {...register('message')}
          rows={5}
          placeholder="What's on your mind?"
          className={inputClass}
          style={{ resize: 'vertical', ...(errors.message ? { borderColor: 'var(--accent-pulse)' } : {}) }}
        />
        {errors.message && <p className="mt-1 text-xs" style={{ color: 'var(--accent-pulse)' }}>{errors.message.message}</p>}
      </div>

      {submitState === 'error' && (
        <p className="text-sm" style={{ color: 'var(--accent-pulse)' }} aria-live="polite">
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <Button type="submit" size="lg" loading={submitState === 'submitting'} className="w-full">
        SEND MESSAGE
      </Button>
    </form>
  )
}
