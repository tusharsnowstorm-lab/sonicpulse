'use client'

export default function ScheduleActions() {
  const handleAddToCalendar = () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'SUMMARY:Sonic Pulse — Dhaka Music Festival',
      'DTSTART:20260925T160000',
      'DTEND:20260926T093000',
      'DESCRIPTION:Two stages. 800+ festival-goers. 4 PM Friday to 9:30 AM Saturday.',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sonic-pulse-2026.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="flex items-center gap-3" style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
      <button
        onClick={handleAddToCalendar}
        className="cursor-pointer"
        style={{
          padding: '13px 26px',
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 999,
          background: 'transparent',
          color: '#fff',
          border: '1px solid var(--border-strong)',
          touchAction: 'manipulation',
          fontFamily: 'var(--font-montserrat)',
        }}
      >
        Add to calendar
      </button>
      <button
        onClick={handleShare}
        className="cursor-pointer"
        style={{
          padding: '13px 26px',
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 999,
          background: 'transparent',
          color: 'var(--text-dim)',
          border: '1px solid var(--border)',
          touchAction: 'manipulation',
          fontFamily: 'var(--font-montserrat)',
        }}
      >
        Share schedule
      </button>
    </div>
  )
}
