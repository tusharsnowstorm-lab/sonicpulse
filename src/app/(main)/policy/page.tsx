'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'

const policies = [
  {
    section: 'Tickets',
    items: [
      {
        title: 'Tickets are non-refundable',
        body: "All ticket sales are final. If the event is cancelled due to circumstances outside the organiser's control, your ticket carries over to the next edition of Sonic Pulse.",
        tag: { label: 'No refunds', variant: 'danger' as const },
      },
      {
        title: 'One ticket, one entry',
        body: 'Each ticket is valid for one person only and cannot be shared. Your ticket is linked to your registered ID — you must present a matching photo ID at the gate.',
        tag: { label: 'Strictly enforced', variant: 'danger' as const },
      },
    ],
  },
  {
    section: 'Prohibited',
    items: [
      {
        title: 'No personal speakers allowed',
        body: 'All kinds of personal speakers are banned inside the venue. The festival provides a professional sound system — bringing your own disrupts the experience for everyone around you.',
        tag: { label: 'Not permitted', variant: 'warning' as const },
      },
      {
        title: 'No narcotics or alcohol',
        body: 'Bringing or consuming narcotics, illegal substances, or alcohol anywhere on the premises is strictly prohibited. Attendees suspected of being intoxicated may be denied entry or removed.',
        tag: { label: 'Zero tolerance', variant: 'danger' as const },
      },
      {
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
        title: 'Respect attendees and staff',
        body: 'Treat everyone at the event — attendees, artists, and staff — with respect. Follow instructions from security and event staff at all times.',
        tag: null,
      },
      {
        title: 'Venue rules apply',
        body: 'All venue regulations and any additional instructions communicated on the day must be followed. Management reserves the right to update these rules at any time.',
        tag: null,
      },
    ],
  },
]

const tagStyles = {
  danger: { bg: 'rgba(226,75,74,0.12)', color: '#e24b4a' },
  warning: { bg: 'rgba(186,117,23,0.14)', color: '#ef9f27' },
}

function PolicyRow({ title, body, tag }: {
  title: string
  body: string
  tag: { label: string; variant: 'danger' | 'warning' } | null
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left flex items-center gap-3 py-4"
        style={{ background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}
      >
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-montserrat)' }}>{title}</span>
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
            color: open ? 'var(--accent-magenta)' : 'var(--text-label-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: open ? '300px' : '0' }}>
        <div className="pb-4">
          {tag && (
            <span
              className="sm:hidden inline-block mb-2 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: tagStyles[tag.variant].bg, color: tagStyles[tag.variant].color }}
            >
              {tag.label}
            </span>
          )}
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>{body}</p>
        </div>
      </div>
    </div>
  )
}

export default function PolicyPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader
        eyebrow="Please read carefully"
        title="Event policy and rules"
        sub="By attending Sonic Pulse you agree to abide by these rules."
        className="mb-10"
      />

      <div
        className="mb-8 rounded-xl px-5 py-3.5"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          Violations result in immediate removal and may lead to a permanent ban from future events.
        </p>
      </div>

      <div className="max-w-2xl">
        {policies.map(({ section, items }) => (
          <div key={section} className="mb-8">
            <p style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-label-muted)', marginBottom: 4, fontFamily: 'var(--font-montserrat)', fontWeight: 700 }}>
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

      <p style={{ marginTop: 32, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>
        Sonic Pulse · Last updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>
    </div>
  )
}
