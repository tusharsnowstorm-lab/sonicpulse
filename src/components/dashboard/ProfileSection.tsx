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
  instagram_handle?: string
  gender?: string
  id_type?: string
}

type IdType = 'nid' | 'passport' | 'birth_certificate'

const ID_TYPE_OPTIONS: { value: IdType; label: string; short: string; placeholder: string; docLabel: string }[] = [
  { value: 'nid',               label: 'National ID (NID)',    short: 'NID',               placeholder: '10 or 17 digit NID',         docLabel: 'NID Document' },
  { value: 'passport',          label: 'Passport',             short: 'Passport',           placeholder: 'e.g. AB1234567',             docLabel: 'Passport Document' },
  { value: 'birth_certificate', label: 'Birth Certificate',    short: 'Birth Certificate',  placeholder: '17-digit certificate number', docLabel: 'Birth Certificate Document' },
]

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
  const [instagramHandle, setInstagramHandle] = useState('')
  const [gender, setGender] = useState('')
  const [idType, setIdType] = useState<IdType>('nid')
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
          setInstagramHandle(profile.instagram_handle ?? '')
          setGender(profile.gender ?? '')
          setIdType((profile.id_type as IdType) ?? 'nid')
        } else {
          setEditing(true)
        }
        setLoading(false)
      })
  }, [])

  const selectedIdOption = ID_TYPE_OPTIONS.find((o) => o.value === idType) ?? ID_TYPE_OPTIONS[0]

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const fd = new FormData()
    fd.append('fullName', fullName)
    fd.append('phone', phone)
    fd.append('nidNumber', nidNumber)
    fd.append('instagramHandle', instagramHandle.replace(/^@/, ''))
    fd.append('gender', gender)
    fd.append('idType', idType)
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
    return <div className="rounded-lg h-40 animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
  }

  const profileIdOption = ID_TYPE_OPTIONS.find((o) => o.value === (profile?.id_type ?? 'nid')) ?? ID_TYPE_OPTIONS[0]

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>
            My Information
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Save your details once — use them when buying tickets for yourself.
          </p>
        </div>
        {profile && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <Pencil size={12} />
            Edit
          </button>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded px-4 py-3 mb-4 text-sm" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
          <CheckCircle size={15} />
          Information saved successfully.
        </div>
      )}

      <div className="rounded-lg p-5 sm:p-6" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        {!editing && profile ? (
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
              <p style={labelStyle}>ID type</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{profileIdOption.label}</p>
            </div>
            <div>
              <p style={labelStyle}>{profileIdOption.short} number</p>
              <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                {profile.nid_number ? `${profile.nid_number.slice(0, 4)}••••••` : '—'}
              </p>
            </div>
            <div>
              <p style={labelStyle}>Instagram</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {profile.instagram_handle ? `@${profile.instagram_handle}` : '—'}
              </p>
            </div>
            <div>
              <p style={labelStyle}>Gender</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : '—'}
              </p>
            </div>
            <div>
              <p style={labelStyle}>{profileIdOption.docLabel}</p>
              <p className="text-sm" style={{ color: profile.nid_file_path ? '#22c55e' : 'var(--text-muted)' }}>
                {profile.nid_file_path ? '✓ Uploaded' : 'Not uploaded'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label style={labelStyle}>Full name (as on ID document)</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} placeholder="Mohammad Rahman" />
              </div>
              <div>
                <label style={labelStyle}>Phone number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="+8801XXXXXXXXX" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>ID document type</label>
              <div className="grid grid-cols-3 gap-2">
                {ID_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIdType(opt.value)}
                    className="py-2.5 px-2 rounded text-xs font-semibold transition-all cursor-pointer"
                    style={{
                      background: idType === opt.value ? 'rgba(0,240,255,0.12)' : 'var(--bg-surface)',
                      border: idType === opt.value ? '2px solid var(--accent-electric)' : '2px solid var(--border)',
                      color: idType === opt.value ? 'var(--accent-electric)' : 'var(--text-muted)',
                    }}
                  >
                    {opt.short}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label style={labelStyle}>{selectedIdOption.short} number</label>
                <input
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  style={inputStyle}
                  placeholder={selectedIdOption.placeholder}
                />
              </div>
              <div>
                <label style={labelStyle}>Instagram handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>@</span>
                  <input
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))}
                    style={{ ...inputStyle, paddingLeft: 28 }}
                    placeholder="yourhandle"
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Gender</label>
              <div className="grid grid-cols-2 gap-3">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className="py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                    style={{
                      background: gender === g ? 'rgba(0,240,255,0.12)' : 'var(--bg-surface)',
                      border: gender === g ? '2px solid var(--accent-electric)' : '2px solid var(--border)',
                      color: gender === g ? 'var(--accent-electric)' : 'var(--text-muted)',
                    }}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                {selectedIdOption.docLabel}{' '}
                {profile?.nid_file_path && (
                  <span style={{ color: '#22c55e', textTransform: 'none', letterSpacing: 0 }}>
                    (already uploaded — upload again to replace)
                  </span>
                )}
              </label>
              <FileUpload onChange={(f) => setNidFile(f)} label={selectedIdOption.docLabel} />
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
                    setInstagramHandle(profile.instagram_handle ?? '')
                    setGender(profile.gender ?? '')
                    setIdType((profile.id_type as IdType) ?? 'nid')
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
