'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/ui/FileUpload'
import { ticketTiers, MAX_TICKETS_PER_ORDER } from '@/data/tickets'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().refine((val) => {
    const dob = new Date(val)
    const today = new Date()
    const age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    return age > 18 || (age === 18 && (m > 0 || (m === 0 && today.getDate() >= dob.getDate())))
  }, 'You must be 18 or older to attend'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^\+?880\d{10}$/, 'Enter a valid Bangladesh phone number (+880XXXXXXXXXX)'),
  instagramHandle: z.string().min(1, 'Instagram handle is required').regex(/^@?[\w.]+$/, 'Enter a valid Instagram handle'),
  nidNumber: z.string().regex(/^\d{10}$|^\d{17}$/, "Bangladesh NIDs are 10 or 17 digits"),
  ticketQty: z.number().int().min(1).max(MAX_TICKETS_PER_ORDER),
  ticketTier: z.enum(['phase1', 'phase2', 'phase3']),
  terms: z.literal(true, { error: () => ({ message: 'You must accept the terms to continue' }) }),
})

type FormData = z.infer<typeof schema>

type Props = { selectedTier: 'phase1' | 'phase2' | 'phase3' | null }

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
        {label} {required && <span style={{ color: 'var(--accent-pulse)' }}>*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--accent-pulse)' }} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const inputClass = `
  w-full px-4 py-3 rounded-[4px] text-sm bg-[var(--bg-elevated)]
  border border-[var(--border)] text-[var(--text-primary)]
  focus:outline-none focus:border-[var(--accent-magenta)]
  transition-colors duration-150 placeholder:text-[var(--text-muted)]
`

export default function RegistrationForm({ selectedTier }: Props) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [referenceCode, setReferenceCode] = useState<string>('')
  const [nidFile, setNidFile] = useState<File | null>(null)
  const [nidFileError, setNidFileError] = useState<string>('')
  const [serverError, setServerError] = useState<string>('')
  const [shuttle, setShuttle] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ticketTier: selectedTier ?? 'phase1',
      ticketQty: 1,
    },
  })

  const watchedTier = watch('ticketTier')
  const currentTierData = ticketTiers.find((t) => t.id === watchedTier)

  const onSubmit = async (data: FormData) => {
    if (!nidFile) {
      setNidFileError('NID document is required')
      return
    }
    setNidFileError('')
    setSubmitState('submitting')
    setServerError('')

    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)))
    formData.append('nidFile', nidFile)
    formData.append('shuttle', shuttle ? 'yes' : 'no')

    try {
      const res = await fetch('/api/register', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Something went wrong')
      setReferenceCode(json.referenceCode)
      setSubmitState('success')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      setSubmitState('error')
    }
  }

  if (submitState === 'success') {
    return (
      <div
        className="p-8 rounded-[4px] text-center"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent-magenta)' }}
        aria-live="polite"
      >
        <div className="text-4xl mb-4">âš¡</div>
        <h3
          className="text-2xl font-black mb-2"
          style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--accent-magenta)' }}
        >
          Registration Submitted.
        </h3>
        <p className="text-[var(--text-muted)] mb-4">We'll review your details and email you when you're approved to pay.</p>
        <p
          className="text-sm font-bold"
          style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--accent-volt)' }}
        >
          Reference: {referenceCode}
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">Save this reference number.</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {/* Tier selector */}
      <FormField label="Ticket Tier" required>
        <select
          {...register('ticketTier')}
          className={inputClass}
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
          onChange={(e) => setValue('ticketTier', e.target.value as 'phase1' | 'phase2' | 'phase3')}
        >
          {ticketTiers.map((t) => (
            <option key={t.id} value={t.id} disabled={t.status === 'sold_out'}>
              {t.label} — ৳{t.price.toLocaleString()} BDT{t.status === 'sold_out' ? ' (Sold Out)' : ''}
            </option>
          ))}
        </select>
        {currentTierData && (
          <p className="mt-1.5 text-xs" style={{ color: 'var(--accent-magenta)', fontFamily: 'var(--font-jetbrains-mono)' }}>
            ৳{currentTierData.price.toLocaleString()} BDT per ticket
          </p>
        )}
      </FormField>

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label="Full Name" required error={errors.fullName?.message}>
          <input
            {...register('fullName')}
            type="text"
            placeholder="As on your NID"
            className={inputClass}
            style={errors.fullName ? { borderColor: 'var(--accent-pulse)' } : {}}
          />
        </FormField>
        <FormField label="Date of Birth" required error={errors.dateOfBirth?.message}>
          <input
            {...register('dateOfBirth')}
            type="date"
            className={inputClass}
            style={{
              colorScheme: 'dark',
              ...(errors.dateOfBirth ? { borderColor: 'var(--accent-pulse)' } : {}),
            }}
          />
        </FormField>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label="Email Address" required error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className={inputClass}
            style={errors.email ? { borderColor: 'var(--accent-pulse)' } : {}}
          />
        </FormField>
        <FormField label="Phone Number" required error={errors.phone?.message}>
          <input
            {...register('phone')}
            type="tel"
            placeholder="+8801XXXXXXXXX"
            className={inputClass}
            style={errors.phone ? { borderColor: 'var(--accent-pulse)' } : {}}
          />
        </FormField>
      </div>

      <FormField label="Instagram Handle" required error={errors.instagramHandle?.message}>
        <input
          {...register('instagramHandle')}
          type="text"
          placeholder="@yourhandle"
          className={inputClass}
          style={errors.instagramHandle ? { borderColor: 'var(--accent-pulse)' } : {}}
        />
      </FormField>

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label="NID Number" required error={errors.nidNumber?.message}>
          <input
            {...register('nidNumber')}
            type="text"
            placeholder="10 or 17 digit NID"
            className={inputClass}
            style={errors.nidNumber ? { borderColor: 'var(--accent-pulse)' } : {}}
            maxLength={17}
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">Old NID: 10 digits · Smart card: 17 digits</p>
        </FormField>
        <FormField label="Number of Tickets" required error={errors.ticketQty?.message}>
          <input
            {...register('ticketQty', { valueAsNumber: true })}
            type="number"
            min={1}
            max={MAX_TICKETS_PER_ORDER}
            className={inputClass}
            style={errors.ticketQty ? { borderColor: 'var(--accent-pulse)' } : {}}
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">Max {MAX_TICKETS_PER_ORDER} per registration</p>
        </FormField>
      </div>

      {/* NID Upload */}
      <FileUpload
        onChange={setNidFile}
        error={nidFileError}
        label="NID Document (photo or scan)"
      />

      {/* Shuttle add-on */}
      <button
        type="button"
        onClick={() => setShuttle((s) => !s)}
        className="w-full flex items-start gap-4 p-4 rounded-[4px] text-left transition-all duration-200 cursor-pointer"
        style={{
          background: shuttle ? 'rgba(255,63,194,0.06)' : 'var(--bg-elevated)',
          border: shuttle ? '1px solid rgba(255,63,194,0.4)' : '1px solid var(--border)',
          touchAction: 'manipulation',
        }}
      >
        <div
          className="shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-all duration-150"
          style={{
            background: shuttle ? 'var(--accent-magenta)' : 'transparent',
            border: shuttle ? '2px solid var(--accent-magenta)' : '2px solid var(--border)',
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
            <span className="text-sm font-bold" style={{ color: shuttle ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: 'var(--font-space-grotesk)' }}>
              🚌 Add shuttle transport
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--accent-magenta)', fontFamily: 'var(--font-jetbrains-mono)' }}>
              +৳800
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Round-trip shuttle service to and from the venue. Pickup point and schedule will be emailed closer to the event.
          </p>
        </div>
      </button>

      {/* Privacy notice */}
      <div
        className="p-4 rounded-[4px] text-xs text-[var(--text-muted)] leading-relaxed"
        style={{ background: 'var(--bg-elevated)', borderLeft: '2px solid var(--accent-magenta)' }}
      >
        <strong style={{ color: 'var(--text-primary)' }}>Privacy Notice:</strong> Your NID is stored encrypted in a private, access-controlled vault. It is used only to verify your identity for this event and is accessible only to authorised staff. We comply with Bangladesh Digital Security Act obligations.
      </div>

      {/* Terms */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...register('terms')}
            type="checkbox"
            className="mt-1 w-4 h-4 shrink-0 accent-[var(--accent-magenta)]"
          />
          <span className="text-sm text-[var(--text-muted)]">
            I agree to the{' '}
            <a href="#" style={{ color: 'var(--accent-magenta)' }}>Terms & Conditions</a>
            {' '}and{' '}
            <a href="#" style={{ color: 'var(--accent-magenta)' }}>Privacy Policy</a>.
            I understand tickets are non-transferable and non-refundable.
          </span>
        </label>
        {errors.terms && (
          <p className="mt-1.5 text-xs" style={{ color: 'var(--accent-pulse)' }} role="alert">
            {errors.terms.message}
          </p>
        )}
      </div>

      {/* Server error */}
      {submitState === 'error' && serverError && (
        <div
          className="p-4 rounded-[4px] text-sm"
          style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid var(--accent-pulse)', color: 'var(--accent-pulse)' }}
          aria-live="polite"
        >
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        loading={submitState === 'submitting'}
        className="w-full"
      >
        {submitState === 'submitting' ? 'Submitting...' : 'SUBMIT REGISTRATION'}
      </Button>

      <p className="text-center text-xs text-[var(--text-muted)]">
        Payment is only processed after your registration is reviewed and approved.
      </p>
    </form>
  )
}
