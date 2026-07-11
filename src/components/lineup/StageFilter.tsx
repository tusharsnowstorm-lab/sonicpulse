'use client'

export type StageFilter = 'all' | 'main' | 'sunrise'

type Props = {
  active: StageFilter
  onChange: (v: StageFilter) => void
}

const tabs: { value: StageFilter; label: string }[] = [
  { value: 'all',     label: 'All' },
  { value: 'main',    label: 'Main Stage' },
  { value: 'sunrise', label: 'Sunrise Stage' },
]

export default function StageFilter({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label="Filter by stage">
      {tabs.map(({ value, label }) => (
        <button
          key={value}
          role="tab"
          aria-selected={active === value}
          onClick={() => onChange(value)}
          className="px-4 py-2 rounded-full text-xs font-semibold uppercase transition-all duration-200 cursor-pointer"
          style={{
            fontFamily: 'var(--font-montserrat)',
            letterSpacing: '0.08em',
            background: active === value ? '#fff' : 'transparent',
            color: active === value ? '#000' : 'rgba(255,255,255,0.45)',
            border: '1px solid var(--border-strong)',
            touchAction: 'manipulation',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
