import { artists } from '@/data/artists'

const stats = [
  { value: '800+', label: 'Expected Ravers' },
  { value: '2',    label: 'Stages' },
  { value: String(artists.length), label: 'Artists' },
  { value: 'Dhaka, BD', label: 'Location' },
]

export default function StatsBar() {
  return (
    <div
      className="py-5 border-y"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-[var(--border)]">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center text-center px-4">
              <span
                className="text-2xl md:text-3xl font-black leading-none"
                style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--accent-electric)' }}
              >
                {value}
              </span>
              <span
                className="mt-1 text-[10px] tracking-[0.2em] uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
