'use client'
import { useState, useEffect } from 'react'
import { Save, Pencil, CheckCircle } from 'lucide-react'
import FileUpload from '@/components/ui/FileUpload'
import Button from '@/components/ui/Button'

type Profile = {
  full_name?: string
  phone?: string
  nid_number?: string
  nid_file_path?: string
}

const inputStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '10px 12px',
  width: '100%',
  fontSize: 14,
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

export default function ProfileSection() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [nidNumber, setNidNumber] = useState('')
  const [nidFile, setNidFile] = useState<File | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then(({ profile }) => {
        setProfile(profile)
        if (profile) {
          setFullName(profile.full_name ?? '')
          setPhone(profile.phone ?? '')
          setNidNumber(profile.nid_number ?? '')
        } else {
          setEditing(true)
        }
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const fd = new FormData()
    fd.append('fullName', fullName)
    fd.append('phone', phone)
    fd.append('nidNumber', nidNumber)
    if (nidFile) fd.append('nidFile', nidFile)

    const res = await fetch('/api/profile', { method: 'PUT', body: fd })
    const json = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(json.error ?? 'Something went wrong.')
    } else {
      setProfile(json.profile)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg h-40 animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}
          >
            My Information
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Save your details once — use them when buying tickets for yourself.
          </p>
        </div>
        {profile && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer transition-colors"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <Pencil size={12} />
            Edit
          </button>
        )}
      </div>

      {/* Saved confirmation */}
      {saved && (
        <div
          className="flex items-center gap-2 rounded px-4 py-3 mb-4 text-sm"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}
        >
          <CheckCircle size={15} />
          Information saved successfully.
        </div>
      )}

      <div
        className="rounded-lg p-5 sm:p-6"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        {!editing && profile ? (
          /* Read-only view */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p style={labelStyle}>Full name</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{profile.full_name || '—'}</p>
            </div>
            <div>
              <p style={labelStyle}>Phone number</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{profile.phone || '—'}</p>
            </div>
            <div>
              <p style={labelStyle}>NID number</p>
              <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                {profile.nid_number ? `${profile.nid_number.slice(0, 4)}••••••` : '—'}
              </p>
            </div>
            <div>
              <p style={labelStyle}>NID document</p>
              <p className="text-sm" style={{ color: profile.nid_file_path ? '#22c55e' : 'var(--text-muted)' }}>
                {profile.nid_file_path ? '✓ Uploaded' : 'Not uploaded'}
              </p>
            </div>
          </div>
        ) : (
          /* Edit form */
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label style={labelStyle}>Full name (as on NID)</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                  placeholder="Mohammad Rahman"
                />
              </div>
              <div>
                <label style={labelStyle}>Phone number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                  placeholder="+8801XXXXXXXXX"
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>NID number</label>
              <input
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                style={inputStyle}
                placeholder="10 or 17 digit NID"
              />
            </div>

            <div>
              <label style={labelStyle}>NID document {profile?.nid_file_path && <span style={{ color: '#22c55e', textTransform: 'none', letterSpacing: 0 }}>(already uploaded — upload again to replace)</span>}</label>
              <FileUpload
                onChange={(f) => setNidFile(f)}
                label="NID Document"
              />
            </div>

            {error && (
              <p className="text-sm rounded px-3 py-2" style={{ background: 'rgba(255,45,107,0.1)', border: '1px solid rgba(255,45,107,0.3)', color: 'var(--accent-pulse)' }}>
                {error}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {profile && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setFullName(profile.full_name ?? '')
                    setPhone(profile.phone ?? '')
                    setNidNumber(profile.nid_number ?? '')
                    setNidFile(null)
                  }}
                  className="w-full sm:w-auto px-4 py-3 rounded text-sm cursor-pointer"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
              )}
              <Button onClick={handleSave} disabled={saving} className="w-full sm:flex-1">
                <Save size={14} className="inline mr-2" />
                {saving ? 'Saving…' : 'Save information'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
