import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Event Policy & Rules — Sonic Pulse',
  description: 'Rules and policies for Sonic Pulse 2026. All attendees must read before entering the venue.',
}

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
    section: 'Prohibited items & conduct',
    items: [
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
    section: 'Recording & social media',
    items: [
      {
        icon: '📵',
        title: 'No live streaming during the event',
        body: 'Live streaming to any platform (Instagram, TikTok, YouTube, Facebook, etc.) is not permitted during the event. Taking photos and personal video recordings is fine — just no real-time social media posting while you are at the venue.',
        tag: { label: 'No live streams', variant: 'warning' as const },
      },
    ],
  },
  {
    section: 'General',
    items: [
      {
        icon: '🤝',
        title: 'Respect fellow attendees and staff',
        body: 'Treat everyone at the event — attendees, artists, and staff — with respect. Follow instructions from security and event staff at all times.',
        tag: null,
      },
      {
        icon: '📋',
        title: 'Venue rules apply',
        body: 'All venue regulations and any additional instructions communicated on the day of the event must be followed. Management reserves the right to update these rules at any time.',
        tag: null,
      },
    ],
  },
]

const tagStyles: Record<string, { bg: string; color: string }> = {
  danger: { bg: 'rgba(220,38,38,0.12)', color: '#f87171' },
  warning: { bg: 'rgba(217,119,6,0.12)', color: '#fbbf24' },
}

export default function PolicyPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-12 md:py-20">
      {/* Header */}
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
        <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7, maxWidth: 640 }}>
          All attendees must read and agree to these policies before entering the venue. By attending Sonic Pulse 2026 you agree to abide by these rules.
        </p>
      </div>

      {/* Warning banner */}
      <div
        className="mb-10 rounded-xl px-5 py-4 flex gap-4 items-start"
        style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)' }}
      >
        <span style={{ fontSize: 20, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: 15, color: '#f87171', lineHeight: 1.7 }}>
          <strong>Failure to abide by these rules</strong> results in immediate removal from the venue and may result in a permanent ban from future Sonic Pulse events.
        </p>
      </div>

      {/* Policy sections */}
      <div className="max-w-3xl space-y-10">
        {policies.map(({ section, items }) => (
          <div key={section}>
            <p
              className="text-[10px] tracking-[0.25em] uppercase mb-4"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              {section}
            </p>
            <div className="flex flex-col gap-4">
              {items.map(({ icon, title, body, tag }) => (
                <div
                  key={title}
                  className="rounded-xl px-5 py-5 flex gap-4 items-start"
                  style={{ background: 'var(--card-bg, rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {title}
                    </p>
                    <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                      {body}
                    </p>
                    {tag && (
                      <span
                        className="inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: tagStyles[tag.variant].bg, color: tagStyles[tag.variant].color }}
                      >
                        {tag.label}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p
        className="mt-12 text-xs tracking-widest uppercase"
        style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        Sonic Pulse 2026 · Last updated July 2026
      </p>
    </div>
  )
}
