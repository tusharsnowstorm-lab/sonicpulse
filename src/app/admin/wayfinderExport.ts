// Pure helpers for the admin Wayfinder tab: filtering support, CSV/JSON export,
// Instagram normalisation, age computation. Client-side only. See §8.56.

export type WayfinderApplication = {
  id: string
  full_name: string
  email: string
  phone: string
  institution: string
  level: 'undergraduate_final' | 'hsc_alevel' | 'other'
  gender: 'female' | 'male' | 'prefer_not_to_say' | null
  graduation_year: number | null
  date_of_birth: string | null
  shift_preference: 'dusk' | 'dawn' | 'either'
  stay_to_close: boolean
  motivation: string | null
  emergency_contact_name: string
  emergency_contact_phone: string
  instagram_handle: string | null
  notes: string | null
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected'
  assigned_shift: 'dusk' | 'dawn' | null
  reference_code: string
  created_at: string
}

export const LEVEL_LABEL: Record<WayfinderApplication['level'], string> = {
  undergraduate_final: 'Final-year undergraduate',
  hsc_alevel: 'HSC / A-level finisher',
  other: 'Other',
}

export const GENDER_LABEL: Record<string, string> = {
  female: 'Female',
  male: 'Male',
  prefer_not_to_say: 'Prefer not to say',
}

export const SHIFT_LABEL: Record<string, string> = {
  dusk: 'Shift A · Dusk',
  dawn: 'Shift B · Dawn',
  either: 'Either shift',
}

// Normalise a free-text Instagram field: applicants paste bare handles,
// @handles, full profile URLs with tracking params, or several handles at
// once. Returns bare handles, no '@'. Empty array when nothing usable.
export function instagramHandles(raw: string | null): string[] {
  const value = (raw ?? '').trim()
  if (!value) return []
  if (value.toLowerCase().includes('instagram.com/')) {
    const tail = value.split(/instagram\.com\//i).pop() ?? ''
    const name = tail.split(/[/?#]/)[0].replace(/^@+/, '')
    return name ? [name] : []
  }
  return value
    .split(/[\s/,]+/)
    .map((part) => part.replace(/^@+/, ''))
    .filter(Boolean)
}

// Age on the event night, 25 Sep 2026 (§8.0). UTC arithmetic so the result
// does not depend on the viewer's timezone. Null when dob is missing/bad.
const EVENT_NIGHT = { year: 2026, month: 8, day: 25 } // month is 0-based
export function ageOnEventNight(dob: string | null): number | null {
  if (!dob) return null
  const d = new Date(dob.slice(0, 10) + 'T00:00:00Z')
  if (isNaN(d.getTime())) return null
  let age = EVENT_NIGHT.year - d.getUTCFullYear()
  if (
    d.getUTCMonth() > EVENT_NIGHT.month ||
    (d.getUTCMonth() === EVENT_NIGHT.month && d.getUTCDate() > EVENT_NIGHT.day)
  ) age--
  return age
}

export type ColumnSet = 'everything' | 'summary' | 'contacts'

const igDisplay = (a: WayfinderApplication) =>
  instagramHandles(a.instagram_handle).map((h) => '@' + h).join(' / ')

const COLUMNS: Record<ColumnSet, [string, (a: WayfinderApplication) => string][]> = {
  everything: [
    ['Reference', (a) => a.reference_code],
    ['Name', (a) => a.full_name],
    ['Gender', (a) => (a.gender ? GENDER_LABEL[a.gender] : '')],
    ['Email', (a) => a.email],
    ['Phone', (a) => a.phone],
    ['Institution', (a) => a.institution],
    ['Level', (a) => LEVEL_LABEL[a.level]],
    ['Graduation year', (a) => (a.graduation_year ? String(a.graduation_year) : '')],
    ['Date of birth', (a) => a.date_of_birth ?? ''],
    ['Age on event night', (a) => {
      const n = ageOnEventNight(a.date_of_birth)
      return n === null ? '' : String(n)
    }],
    ['Shift preference', (a) => SHIFT_LABEL[a.shift_preference]],
    ['Can stay to close', (a) => (a.stay_to_close ? 'yes' : 'no')],
    ['Assigned shift', (a) => (a.assigned_shift ? SHIFT_LABEL[a.assigned_shift] : '')],
    ['Status', (a) => a.status],
    ['Instagram', igDisplay],
    ['Emergency contact', (a) => a.emergency_contact_name],
    ['Emergency phone', (a) => a.emergency_contact_phone],
    ['Motivation', (a) => a.motivation ?? ''],
    ['Notes', (a) => a.notes ?? ''],
    ['Applied', (a) => a.created_at],
  ],
  summary: [
    ['Name', (a) => a.full_name],
    ['Gender', (a) => (a.gender ? GENDER_LABEL[a.gender] : '')],
    ['Instagram', igDisplay],
    ['Institution', (a) => a.institution],
    ['Level', (a) => LEVEL_LABEL[a.level]],
    ['Birth year', (a) => (a.date_of_birth ? a.date_of_birth.slice(0, 4) : '')],
  ],
  contacts: [
    ['Name', (a) => a.full_name],
    ['Instagram', igDisplay],
    ['Phone', (a) => a.phone],
    ['Emergency contact', (a) => a.emergency_contact_name],
    ['Emergency phone', (a) => a.emergency_contact_phone],
  ],
}

export function exportRows(apps: WayfinderApplication[], set: ColumnSet): { headers: string[]; rows: string[][] } {
  const cols = COLUMNS[set]
  const sorted = [...apps].sort((a, b) =>
    a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase(), 'en'))
  return { headers: cols.map(([h]) => h), rows: sorted.map((a) => cols.map(([, fn]) => fn(a))) }
}

// RFC 4180: CRLF line ends, fields containing quotes/commas/newlines are
// quoted with doubled quotes. Leading BOM so Excel opens UTF-8 correctly.
export function toCsv(headers: string[], rows: string[][]): string {
  const esc = (v: string) => (/[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v)
  return '\uFEFF' + [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n')
}

export function downloadBlob(filename: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
