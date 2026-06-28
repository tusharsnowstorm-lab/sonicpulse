const roomTypes = [
  { id: 'standard', label: 'Standard Room', description: 'Coming soon — details will be announced.', available: false },
  { id: 'deluxe',   label: 'Deluxe Room',   description: 'Coming soon — details will be announced.', available: false },
  { id: 'suite',    label: 'Suite',          description: 'Coming soon — details will be announced.', available: false },
]

export default function AccommodationSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}
          >
            Accommodation
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Reserve your stay near the venue.
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded"
          style={{
            background: 'rgba(204,255,0,0.08)',
            border: '1px solid rgba(204,255,0,0.2)',
            color: 'var(--accent-volt)',
            fontFamily: 'var(--font-jetbrains-mono)',
          }}
        >
          Coming soon
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {roomTypes.map((room) => (
          <div
            key={room.id}
            className="rounded-lg p-5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              opacity: 0.55,
            }}
          >
            <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>
              {room.label}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{room.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
