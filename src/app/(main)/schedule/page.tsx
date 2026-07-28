import type { Metadata } from 'next'
import Link from 'next/link'
import { EVENT_DATE_DISPLAY, EVENT_VENUE } from '@/data/schedule'
import NightTimetable from '@/components/lineup/NightTimetable'
import ScheduleActions from '@/components/schedule/ScheduleActions'
import PageHeader from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'Schedule — Sonic Pulse',
  description: 'The full night, in order — 4 PM Friday to 9:30 AM Saturday.',
}

export default function SchedulePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader eyebrow={EVENT_DATE_DISPLAY} title="Schedule" sub={EVENT_VENUE} />
      <NightTimetable />
      <p style={{ marginTop: 24, fontSize: 13.5, color: 'var(--text-dim)' }}>
        Want the artist bios and posters? See the{' '}
        <Link href="/lineup" style={{ color: 'var(--accent-magenta)' }}>full lineup →</Link>
      </p>
      <ScheduleActions />
    </div>
  )
}
