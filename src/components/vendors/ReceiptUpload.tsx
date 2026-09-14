'use client'
import { useRef, useState } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import PillButton from '@/components/ui/PillButton'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const ACCEPTED_EXT = ['.jpg', '.jpeg', '.png', '.pdf']
const MAX_FILES = 3
const MAX_SIZE_MB = 5

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

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: 32,
  textAlign: 'center',
}

type Status = 'idle' | 'uploading' | 'success' | 'error'

type Props = {
  agreementRef?: string
  email?: string
  locked?: boolean
  compact?: boolean
}

export default function ReceiptUpload({ agreementRef = '', email: emailProp = '', locked = false, compact = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [ref, setRef] = useState(agreementRef)
  const [email, setEmail] = useState(emailProp)
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [count, setCount] = useState(0)
  const [dragging, setDragging] = useState(false)

  const validateFiles = (candidate: File[]): string | null => {
    if (candidate.length === 0) return 'Attach at least one receipt.'
    if (candidate.length > MAX_FILES) return 'Up to three files.'
    for (const f of candidate) {
      if (!ACCEPTED_TYPES.includes(f.type)) return 'Receipts must be JPG, PNG or PDF.'
      if (f.size > MAX_SIZE_MB * 1024 * 1024) return 'Each file must be under 5 MB.'
    }
    return null
  }

  const addFiles = (incoming: FileList | File[]) => {
    const next = [...files, ...Array.from(incoming)]
    const err = validateFiles(next)
    if (err) {
      setErrorMsg(err)
      setStatus('error')
      return
    }
    setErrorMsg('')
    setStatus('idle')
    setFiles(next)
  }

  const removeFile = (i: number) => {
    setFiles((f) => f.filter((_, j) => j !== i))
    setErrorMsg('')
    setStatus('idle')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateFiles(files)
    if (err) {
      setErrorMsg(err)
      setStatus('error')
      return
    }
    setErrorMsg('')
    setStatus('uploading')
    try {
      const formData = new FormData()
      formData.append('agreementRef', ref)
      formData.append('email', email)
      files.forEach((f) => formData.append('files', f))

      const res = await fetch('/api/vendors/receipt', { method: 'POST', body: formData })
      const json = await res.json().catch(() => ({}))

      if (res.status === 503 && json.error === 'not_open') {
        setErrorMsg('Uploads open soon.')
        setStatus('error')
        return
      }
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Something went wrong on our end. Try again in a minute, or email the receipt to contact@sonicpulsefestival.com.')
        setStatus('error')
        return
      }

      setCount(json.count ?? files.length)
      setStatus('success')
    } catch {
      setErrorMsg('Something went wrong on our end. Try again in a minute, or email the receipt to contact@sonicpulsefestival.com.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ ...cardStyle, border: '1px solid var(--accent-soft)' }} aria-live="polite">
        <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Receipt received.</p>
        <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>
          We&apos;ll check the transfer and email written confirmation once the funds have cleared.
        </p>
        {count > 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-label-muted)', marginTop: 10 }}>{count} file(s) uploaded.</p>
        )}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: 30, display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      {!compact && (
        <>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-label-muted)', fontWeight: 700 }}>
            Already applied?
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Upload your transfer receipt</p>
          <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>
            Enter your agreement reference and the email you applied with, then attach a photo or PDF of the bank transfer receipt. Up to three files — JPG, PNG or PDF, 5 MB each.
          </p>
        </>
      )}

      <div>
        <label style={labelStyle} htmlFor="rc-ref">Agreement reference</label>
        <input
          id="rc-ref"
          style={fieldStyle}
          required
          readOnly={locked}
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="SP/VEND/2026/FS-B-001"
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="rc-email">Email</label>
        <input
          id="rc-email"
          type="email"
          style={fieldStyle}
          required
          readOnly={locked}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com"
        />
      </div>

      <div>
        <label style={labelStyle}>Receipt files</label>
        <div
          className="relative"
          style={{
            border: `2px dashed ${dragging ? 'var(--accent-magenta)' : 'var(--border)'}`,
            borderRadius: 12,
            padding: 24,
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'rgba(255,63,194,0.05)' : 'transparent',
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Upload receipt files"
        >
          <Upload size={22} className="mx-auto mb-2" style={{ color: 'var(--accent-magenta)' }} />
          <p style={{ fontSize: 14, color: '#fff' }}>
            Drag &amp; drop or <span style={{ color: 'var(--accent-magenta)' }}>browse</span>
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-label-muted)', marginTop: 4 }}>
            JPG, PNG or PDF — up to 3 files, 5 MB each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXT.join(',')}
          className="sr-only"
          onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = '' }}
        />

        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3" style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <FileText size={18} style={{ color: 'var(--accent-magenta)' }} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-label-muted)' }}>{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label="Remove file"
                  style={{ color: 'var(--text-label-muted)', background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {status === 'error' && (
        <p style={{ fontSize: 13, color: '#e24b4a' }} aria-live="polite">{errorMsg}</p>
      )}

      <PillButton type="submit" disabled={status === 'uploading' || files.length === 0} style={{ width: '100%' }}>
        {status === 'uploading' ? 'Uploading…' : 'Upload receipt →'}
      </PillButton>

      <p style={{ fontSize: 11.5, color: 'var(--text-label-muted)', textAlign: 'center' }}>
        Uploading a receipt does not confirm the booking. Confirmation is sent once the funds have cleared.
      </p>
    </form>
  )
}
