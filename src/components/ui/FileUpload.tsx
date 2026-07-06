'use client'
import { useRef, useState } from 'react'
import { Upload, X, FileText } from 'lucide-react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const ACCEPTED_EXT = ['.jpg', '.jpeg', '.png', '.pdf']
const MAX_SIZE_MB = 5

type FileUploadProps = {
  onChange: (file: File | null) => void
  error?: string
  label?: string
}

export default function FileUpload({ onChange, error, label = 'NID Document' }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const validate = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) return 'Only JPG, PNG, or PDF allowed.'
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File is too large (max ${MAX_SIZE_MB}MB). Try compressing the image or saving at a lower resolution.`
    return null
  }

  const handleFile = (f: File) => {
    const err = validate(f)
    if (err) { setLocalError(err); return }
    setLocalError(null)
    setFile(f)
    onChange(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  const clear = () => {
    setFile(null)
    setPreview(null)
    setLocalError(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const displayError = localError || error

  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">
        {label} <span className="text-[var(--accent-pulse)]">*</span>
      </label>

      {!file ? (
        <div
          className={`relative border-2 border-dashed rounded-[4px] p-6 text-center cursor-pointer transition-colors duration-200
            ${dragging ? 'border-[var(--accent-electric)] bg-[rgba(0,240,255,0.05)]' : 'border-[var(--border)] hover:border-[var(--accent-electric)]'}
            ${displayError ? 'border-[var(--accent-pulse)]' : ''}
          `}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const f = e.dataTransfer.files[0]
            if (f) handleFile(f)
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Upload NID document"
        >
          <Upload size={24} className="mx-auto mb-2" style={{ color: 'var(--accent-electric)' }} />
          <p className="text-sm text-[var(--text-primary)]">Drag & drop or <span style={{ color: 'var(--accent-electric)' }}>browse</span></p>
          <p className="text-xs text-[var(--text-muted)] mt-1">JPG, PNG or PDF — max {MAX_SIZE_MB}MB</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border)]">
          {preview ? (
            <img src={preview} alt="NID preview" className="w-12 h-12 object-cover rounded-[2px]" />
          ) : (
            <FileText size={32} style={{ color: 'var(--accent-electric)' }} className="shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--text-primary)] truncate">{file.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            type="button"
            onClick={clear}
            className="p-1 rounded hover:text-[var(--accent-pulse)] text-[var(--text-muted)] transition-colors"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXT.join(',')}
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {displayError && (
        <p className="mt-1.5 text-xs text-[var(--accent-pulse)]" role="alert">{displayError}</p>
      )}
    </div>
  )
}
