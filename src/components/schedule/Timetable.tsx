'use client'
import { useState, useEffect } from 'react'
import { schedule, EVENT_DATE } from '@/data/schedule'
import SetRow from './SetRow'

function isSlotLive(time: string, duration: number, nextDay?: boolean): boolean {
  const now = new Date()
  const [h, m] = time.split(':').map(Number)
  const [year, month, day] = EVENT_DATE.split('-').map(Number)
  const dayOffset = nextDay ? 1 : 0
  const start = new Date(year, month - 1, day + dayOffset, h, m)
  const end = new Date(start.getTime() + duration * 60 * 1000)
  return now >= start && now < end
}

export default function Timetable() {
  const [activeTab, setActiveTab] = useState<'main' | 'sunrise'>('main')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const handleAddToCalendar = () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'SUMMARY:Sonic Pulse — Dhaka Music Festival',
      'DTSTART:20260925T160000',
      'DTEND:20260926T090000',
      'DESCRIPTION:Two stages. 800+ festival-goers. 4 PM Friday to 9 AM Saturday.',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sonic-pulse-2025.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div>
      {/* Tab toggle (mobile) + side-by-side toggle (desktop) */}
      <div className="flex items-center gap-2 mb-8 md:hidden">
        {(['main', 'sunrise'] as const).map((stage) => (
          <button
            key={stage}
            onClick={() => setActiveTab(stage)}
            className="flex-1 py-2.5 text-xs font-semibold uppercase rounded-full transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: 'var(--font-montserrat)',
              letterSpacing: '0.1em',
              background: activeTab === stage ? '#fff' : 'transparent',
              color: activeTab === stage ? '#000' : 'rgba(255,255,255,0.45)',
              border: '1px solid var(--border-strong)',
              touchAction: 'manipulation',
            }}
          >
            {stage === 'main' ? 'Main Stage' : 'Sunrise Stage'}
          </button>
        ))}
      </div>

      {/* Desktop: side by side */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 mb-8">
        {(['main', 'sunrise'] as const).map((stage) => (
          <div key={stage}>
            <h3
              className="text-xs font-bold tracking-[0.3em] uppercase mb-4 pb-3 border-b"
              style={{
                fontFamily: 'var(--font-montserrat)',
                color: stage === 'main' ? '#fff' : 'var(--accent-magenta)',
                borderColor: 'var(--border)',
              }}
            >
              {stage === 'main' ? 'Main Stage' : 'Sunrise Stage'}
            </h3>
            <div className="divide-y divide-[var(--border)]">
              {(stage === 'main' ? schedule.mainStage : schedule.sunriseStage).map((slot) => (
                <SetRow key={slot.artistId} slot={slot} isLive={isSlotLive(slot.time, slot.duration, slot.nextDay)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: single active tab */}
      <div className="md:hidden divide-y divide-[var(--border)]">
        {(activeTab === 'main' ? schedule.mainStage : schedule.sunriseStage).map((slot) => (
          <SetRow key={slot.artistId} slot={slot} isLive={isSlotLive(slot.time, slot.duration, slot.nextDay)} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[var(--border)]">
        <button
          onClick={handleAddToCalendar}
          className="px-6 py-3 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer"
          style={{ fontFamily: 'var(--font-montserrat)', background: 'transparent', color: '#fff', border: '1px solid var(--border-strong)', touchAction: 'manipulation' }}
        >
          Add to calendar
        </button>
        <button
          onClick={handleShare}
          className="px-6 py-3 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer"
          style={{ fontFamily: 'var(--font-montserrat)', background: 'transparent', color: 'rgba(255,255,255,0.45)', border: '1px solid var(--border)', touchAction: 'manipulation' }}
        >
          Share schedule
        </button>
      </div>
    </div>
  )
}
