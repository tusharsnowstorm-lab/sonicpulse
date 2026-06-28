'use client'
import { ticketTiers, CURRENT_PHASE } from '@/data/tickets'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

type Props = {
  onSelect: (tierId: 'phase1' | 'phase2' | 'phase3') => void
  selectedTier: string | null
}

export default function TierCards({ onSelect, selectedTier }: Props) {
  const visibleTiers = ticketTiers.filter((t) => t.id === CURRENT_PHASE)

  return (
    <div className="max-w-md">
      {visibleTiers.map((tier) => {
        const sold = tier.status === 'sold_out'
        const selected = selectedTier === tier.id
        const isCurrent = true

        return (
          <div
            key={tier.id}
            className={`p-6 rounded-[4px] flex flex-col transition-all duration-200 ${sold ? 'opacity-40' : ''}`}
            style={{
              background: 'var(--bg-surface)',
              border: selected
                ? '1px solid var(--accent-electric)'
                : tier.highlight
                ? '1px solid rgba(204,255,0,0.3)'
                : '1px solid var(--border)',
              boxShadow: selected
                ? '0 0 20px rgba(0,240,255,0.2)'
                : tier.highlight
                ? '0 0 12px rgba(204,255,0,0.1)'
                : 'none',
            }}
          >
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-3 min-h-[20px]">
              {tier.badge && (
                <Badge variant={tier.highlight ? 'tier-highlight' : 'tier-last'}>{tier.badge}</Badge>
              )}
              {isCurrent && !sold && (
                <Badge variant="status-available">Current Phase</Badge>
              )}
            </div>

            <p
              className="text-[10px] tracking-[0.25em] uppercase mb-1"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              {tier.label}
            </p>

            <p
              className="text-4xl font-black mb-5"
              style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
            >
              ৳{tier.price.toLocaleString()}
              <span className="text-sm font-normal text-[var(--text-muted)]"> BDT</span>
            </p>

            <ul className="space-y-2 mb-6 flex-1">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                  <span style={{ color: 'var(--accent-electric)' }} className="mt-0.5">—</span>
                  {perk}
                </li>
              ))}
            </ul>

            <Button
              variant={tier.highlight ? 'primary' : 'secondary'}
              size="md"
              disabled={sold}
              className="w-full"
              onClick={() => !sold && onSelect(tier.id as 'phase1' | 'phase2' | 'phase3')}
            >
              {sold ? 'SOLD OUT' : selected ? 'SELECTED âœ“' : 'Register for This Tier'}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
