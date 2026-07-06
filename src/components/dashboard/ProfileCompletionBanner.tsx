'use client'
import { useState, useEffect } from 'react'
import { X, CheckCircle, Circle } from 'lucide-react'

type Profile = {
  full_name?: string
  phone?: string
  nid_number?: string
  nid_file_path?: string
  instagram_handle?: string
  gender?: string
  profile_picture_path?: string
}

const FIELDS: { key: keyof Profile; label: string }[] = [
  { key: 'full_name',            label: 'Full name' },
  { key: 'phone',                label: 'Phone' },
  { key: 'nid_number',           label: 'ID number' },
  { key: 'nid_file_path',        label: 'ID document' },
  { key: 'instagram_handle',     label: 'Instagram' },
  { key: 'gender',               label: 'Gender' },
  { key: 'profile_picture_path', label: 'Profile photo' },
]

const SESSION_KEY = 'sp_profile_banner_dismissed'

export default function ProfileCompletionBanner() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) {
        setDismissed(true)
      }
    } catch {}
    fetch('/api/profile')
      .then((r) => r.json())
      .then(({ profile }) => { setProfile(profile); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  const handleDismiss = () => {
    try { sessionStorage.setItem(SESSION_KEY, '1') } catch {}
    setDismissed(true)
  }

  if (!loaded || dismissed) return null

  const completed = FIELDS.filter((f) => !!profile?.[f.key])
  const missing = FIELDS.filter((f) => !profile?.[f.key])
  const percent = Math.round((completed.length / FIELDS.length) * 100)

  if (percent === 100) return null

  return (
    <div
      className="mx-4 mt-4 rounded-lg overflow-hidden"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      {/* Header row */}
      <div
        className="px-4 py-3 flex items-center justify-between gap-4"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,63,194,0.04)' }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className="text-xs font-bold tracking-widest uppercase shrink-0"
            style={{ color: 'var(--accent-magenta)', fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            Profile {percent}% complete
          </span>

          {/* Progress bar */}
          <div className="flex-1 max-w-[200px] h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                background: percent === 100
                  ? '#22c55e'
                  : percent >= 70
                  ? 'var(--accent-magenta)'
                  : 'var(--accent-volt)',
              }}
            />
          </div>

          <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
            {completed.length} / {FIELDS.length}
          </span>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded cursor-pointer shrink-0 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>

      {/* Fields row */}
      <div className="px-4 py-3 flex flex-wrap gap-2">
        {FIELDS.map(({ key, label }) => {
          const done = !!profile?.[key]
          return (
            <span
              key={key}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{
                background: done ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
                border: done ? '1px solid rgba(34,197,94,0.25)' : '1px solid var(--border)',
                color: done ? '#22c55e' : 'var(--text-muted)',
              }}
            >
              {done
                ? <CheckCircle size={11} />
                : <Circle size={11} />
              }
              {label}
            </span>
          )
        })}

        {missing.length > 0 && (
          <span className="text-xs self-center ml-1" style={{ color: 'var(--text-muted)' }}>
            — scroll down to fill in missing fields
          </span>
        )}
      </div>
    </div>
  )
}
