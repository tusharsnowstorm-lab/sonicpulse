import type { Metadata } from 'next'
import { EVENT_DATE_DISPLAY, EVENT_VENUE } from '@/data/schedule'
import Timetable from '@/components/schedule/Timetable'
import PageHeader from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'Schedule — Sonic Pulse',
  description: 'Full set times for both stages at Sonic Pulse.',
}

export default function SchedulePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader eyebrow={EVENT_DATE_DISPLAY} title="Schedule" sub={EVENT_VENUE} />
      <Timetable />
    </div>
  )
}
