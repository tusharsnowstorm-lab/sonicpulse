import Link from 'next/link'
import { ticketTiers, CURRENT_PHASE } from '@/data/tickets'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export default function TicketsTeaser() {
  return (
    <section
      className="relative py-12 md:py-20 px-4 overflow-hidden"
      style={{
        backgroundImage: 'url(/images/hero-poster.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
      }}
    >
      {/* Strong dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(5,5,8,0.88)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Tickets
        </p>
        <h2
          className="text-2xl md:text-3xl font-black mb-2 glow-heading"
          style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
        >
          GET YOUR SPOT
        </h2>
        <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Register now — approval required before payment.
        </p>

        <div className="max-w-md">
          {ticketTiers.filter((t) => t.id === CURRENT_PHASE).map((tier) => {
            const sold = tier.status === 'sold_out'
            return (
              <div
                key={tier.id}
                className={`p-6 rounded-[4px] flex flex-col ${tier.highlight ? 'glow-border-volt' : 'glow-border'} ${sold ? 'opacity-50' : ''}`}
                style={{ background: 'rgba(13,13,20,0.92)' }}
              >
                {tier.badge && (
                  <div className="mb-3">
                    <Badge variant={tier.highlight ? 'tier-highlight' : 'tier-last'}>{tier.badge}</Badge>
                  </div>
                )}
                <p
                  className="text-[10px] tracking-[0.25em] uppercase mb-1"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
                >
                  {tier.label}
                </p>
                <p
                  className="text-3xl font-black mb-4"
                  style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
                >
                  ৳{tier.price.toLocaleString()}
                  <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}> BDT</span>
                </p>
                <ul className="space-y-1 mb-6 flex-1">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.88)' }}>
                      <span style={{ color: 'var(--accent-electric)' }}>—</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link href="/tickets">
                  <Button
                    variant={tier.highlight ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={sold}
                    className="w-full"
                  >
                    {sold ? 'SOLD OUT' : 'Register Now'}
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
