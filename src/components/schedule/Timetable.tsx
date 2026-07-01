'use client'
import { useState, useEffect } from 'react'
import { schedule, EVENT_DATE } from '@/data/schedule'
import SetRow from './SetRow'

function isSlotLive(time: string, duration: number): boolean {
  const now = new Date()
  const [h, m] = time.split(':').map(Number)
  const [year, month, day] = EVENT_DATE.split('-').map(Number)
  const start = new Date(year, month - 1, day, h, m)
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
      'DTSTART:20251115T220000',
      'DTEND:20251116T060000',
      'LOCATION:Bashundhara Open Grounds, Dhaka',
      'DESCRIPTION:Two stages. 800+ festival-goers. Dawn till dusk.',
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
            className="flex-1 py-2.5 text-xs font-bold tracking-widest uppercase rounded-[4px] transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: 'var(--font-jetbrains-mono)',
              background: activeTab === stage ? 'var(--accent-electric)' : 'var(--bg-surface)',
              color: activeTab === stage ? 'var(--bg-void)' : 'var(--text-muted)',
              border: '1px solid var(--border)',
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
                fontFamily: 'var(--font-jetbrains-mono)',
                color: stage === 'main' ? 'var(--accent-volt)' : 'var(--accent-electric)',
                borderColor: 'var(--border)',
              }}
            >
              {stage === 'main' ? 'Main Stage' : 'Sunrise Stage'}
            </h3>
            <div className="divide-y divide-[var(--border)]">
              {(stage === 'main' ? schedule.mainStage : schedule.sunriseStage).map((slot) => (
                <SetRow key={slot.artistId} slot={slot} isLive={isSlotLive(slot.time, slot.duration)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: single active tab */}
      <div className="md:hidden divide-y divide-[var(--border)]">
        {(activeTab === 'main' ? schedule.mainStage : schedule.sunriseStage).map((slot) => (
          <SetRow key={slot.artistId} slot={slot} isLive={isSlotLive(slot.time, slot.duration)} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[var(--border)]">
        <button
          onClick={handleAddToCalendar}
          className="px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-[4px] transition-all duration-200 cursor-pointer"
          style={{
            fontFamily: 'var(--font-jetbrains-mono)',
            background: 'var(--bg-surface)',
            color: 'var(--accent-electric)',
            border: '1px solid var(--accent-electric)',
          }}
        >
          + Add to Calendar
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-[4px] transition-all duration-200 cursor-pointer"
          style={{
            fontFamily: 'var(--font-jetbrains-mono)',
            background: 'var(--bg-surface)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          Share Schedule
        </button>
      </div>
    </div>
  )
}
