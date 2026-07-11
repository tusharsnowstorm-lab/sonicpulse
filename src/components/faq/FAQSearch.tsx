'use client'
import { Search } from 'lucide-react'

type Props = {
  value: string
  onChange: (v: string) => void
}

export default function FAQSearch({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--text-muted)' }}
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search questions..."
        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: '#fff',
          outline: 'none',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent-magenta)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        aria-label="Search FAQ"
      />
    </div>
  )
}
