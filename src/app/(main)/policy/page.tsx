'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const policies = [
  {
    section: 'Entry',
    items: [
      {
        icon: '🎟',
        title: 'One ticket, one entry',
        body: 'Each ticket is valid for one person only and cannot be transferred or shared. Your ticket is linked to your registered ID — you must present a matching photo ID at the gate.',
        tag: { label: 'Strictly enforced', variant: 'danger' as const },
      },
    ],
  },
  {
    section: 'Prohibited',
    items: [
      {
        icon: '🔊',
        title: 'No personal speakers allowed',
        body: 'All kinds of personal speakers are banned inside the venue. The festival provides a professional sound system — bringing your own disrupts the experience for everyone around you.',
        tag: { label: 'Not permitted', variant: 'warning' as const },
      },
      {
        icon: '🚫',
        title: 'No narcotics or alcohol',
        body: 'Bringing or consuming narcotics, illegal substances, or alcohol anywhere on the premises is strictly prohibited. Attendees suspected of being intoxicated may be denied entry or removed.',
        tag: { label: 'Zero tolerance', variant: 'danger' as const },
      },
      {
        icon: '🛡',
        title: 'Safe space — no harassment or bullying',
        body: 'Sonic Pulse is a safe and inclusive event for everyone. Harassment, bullying, or discrimination of any kind — based on gender, ethnicity, religion, or any other characteristic — will not be tolerated.',
        tag: { label: 'Zero tolerance', variant: 'danger' as const },
      },
    ],
  },
  {
    section: 'Recording',
    items: [
      {
        icon: '📵',
        title: 'No live streaming during the event',
        body: 'Live streaming to any platform (Instagram, TikTok, YouTube, Facebook, etc.) is not permitted. Taking photos and personal video recordings is fine — just no real-time social media posting while you are at the venue.',
        tag: { label: 'No live streams', variant: 'warning' as const },
      },
    ],
  },
  {
    section: 'General',
    items: [
      {
        icon: '🤝',
        title: 'Respect attendees and staff',
        body: 'Treat everyone at the event — attendees, artists, and staff — with respect. Follow instructions from security and event staff at all times.',
        tag: null,
      },
      {
        icon: '📋',
        title: 'Venue rules apply',
        body: 'All venue regulations and any additional instructions communicated on the day must be followed. Management reserves the right to update these rules at any time.',
        tag: null,
      },
    ],
  },
]

const tagStyles = {
  danger: { bg: 'rgba(220,38,38,0.15)', color: '#f87171' },
  warning: { bg: 'rgba(217,119,6,0.15)', color: '#fbbf24' },
}

function PolicyRow({ icon, title, body, tag }: {
  icon: string
  title: string
  body: string
  tag: { label: string; variant: 'danger' | 'warning' } | null
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left flex items-center gap-3 py-4"
        style={{ background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}
      >
        <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: 'center' }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        {tag && (
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 hidden sm:inline"
            style={{ background: tagStyles[tag.variant].bg, color: tagStyles[tag.variant].color }}
          >
            {tag.label}
          </span>
        )}
        <ChevronDown
          size={16}
          className="shrink-0 transition-transform duration-200"
          style={{
            color: open ? 'var(--accent-magenta)' : 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? '300px' : '0' }}
      >
        <div className="pb-4 pl-9">
          {tag && (
            <span
              className="sm:hidden inline-block mb-2 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: tagStyles[tag.variant].bg, color: tagStyles[tag.variant].color }}
            >
              {tag.label}
            </span>
          )}
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.75 }}>{body}</p>
        </div>
      </div>
    </div>
  )
}

export default function PolicyPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-12 md:py-20">
      <div className="mb-10">
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Please read carefully
        </p>
        <h1
          className="text-4xl md:text-5xl font-black glow-heading mb-4"
          style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
        >
          Event Policy &amp; Rules
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, maxWidth: 560 }}>
          By attending Sonic Pulse 2026 you agree to abide by these rules.
        </p>
      </div>

      <div
        className="mb-8 rounded-xl px-5 py-3.5 flex gap-3 items-center"
        style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}
      >
        <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: 13, color: '#f87171', lineHeight: 1.6 }}>
          Violations result in immediate removal and may lead to a permanent ban from future events.
        </p>
      </div>

      <div className="max-w-2xl">
        {policies.map(({ section, items }) => (
          <div key={section} className="mb-8">
            <p
              className="text-[10px] tracking-[0.25em] uppercase mb-1"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              {section}
            </p>
            <div>
              {items.map((item) => (
                <PolicyRow key={item.title} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p
        className="mt-8 text-xs tracking-widest uppercase"
        style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        Sonic Pulse 2026 · Last updated July 2026
      </p>
    </div>
  )
}
