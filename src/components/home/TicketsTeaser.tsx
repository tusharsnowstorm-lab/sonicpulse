import { ticketTiers } from '@/data/tickets'
import Section from '@/components/ui/Section'
import { PillLink } from '@/components/ui/PillButton'
import AppPromoBand from '@/components/ui/AppPromoBand'

export default function TicketsTeaser() {
  return (
    <>
      <Section eyebrow="Tickets" title="Choose your night" sub="Every tier includes both stages, all seventeen hours.">
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {ticketTiers.map((tier) => (
            <div
              key={tier.id}
              style={{
                width: 240,
                background: 'var(--bg-elevated)',
                border: tier.highlight ? '1px solid var(--accent-soft)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
                padding: tier.highlight ? '48px 28px' : '38px 28px',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: tier.highlight ? 'var(--accent-magenta)' : 'var(--text-label-muted)',
                  marginBottom: 20,
                  fontFamily: 'var(--font-montserrat)',
                  fontWeight: 700,
                }}
              >
                {tier.label}
              </p>
              <p style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', fontFamily: 'var(--font-montserrat)', margin: 0 }}>
                ৳{tier.price.toLocaleString()}
              </p>
              <p style={{ fontSize: 12, color: 'var(--accent-magenta)', marginTop: 8 }}>
                ৳{tier.appPrice.toLocaleString()} in the app
              </p>
              <ul style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 2.1, marginTop: 22, listStyle: 'none', padding: 0 }}>
                {tier.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <PillLink
                href="/tickets"
                variant={tier.highlight ? 'primary' : 'outline'}
                style={{ marginTop: 26, padding: '12px 32px', fontSize: 13 }}
              >
                Select
              </PillLink>
            </div>
          ))}
        </div>
      </Section>
      <Section tight>
        <AppPromoBand />
      </Section>
    </>
  )
}
