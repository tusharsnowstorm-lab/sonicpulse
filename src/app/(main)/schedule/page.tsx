import type { Metadata } from 'next'
import { EVENT_DATE_DISPLAY, EVENT_VENUE } from '@/data/schedule'
import Timetable from '@/components/schedule/Timetable'

export const metadata: Metadata = {
  title: 'Schedule — Sonic Pulse',
  description: 'Full set times for both stages at Sonic Pulse 2025.',
}

export default function SchedulePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-12 md:py-20">
      <div className="mb-12">
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          {EVENT_DATE_DISPLAY}
        </p>
        <h1
          className="text-4xl md:text-5xl font-black glow-heading"
          style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
        >
          SCHEDULE
        </h1>
        <p className="mt-2 text-[var(--text-muted)] text-sm">{EVENT_VENUE}</p>
      </div>

      <Timetable />
    </div>
  )
}
