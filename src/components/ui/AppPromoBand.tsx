import Image from 'next/image'
import { APP_NAME, AFTERHOURS_REGISTER_URL } from '@/data/tickets'
import { PillLink } from './PillButton'

/** Afterhours hand-off panel — registration is on the Afterhours website for now; the app is coming later. No prices here (§8.39, §8.41). */
export default function AppPromoBand() {
  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        overflow: 'hidden',
        textAlign: 'left',
      }}
      className="app-promo-band"
    >
      <div style={{ padding: '60px 50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', fontFamily: 'var(--font-montserrat)', margin: 0 }}>
          Tickets are open on Afterhours.
        </h3>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)', margin: '12px 0 30px', maxWidth: 340, lineHeight: 1.65 }}>
          Sign up with <span style={{ color: 'var(--accent-magenta)', fontWeight: 600 }}>Google, Apple, or an email code</span> at onlyafterhours.com — your ticket stays on your {APP_NAME} account, ready to show at the gate.
        </p>
        <PillLink href={AFTERHOURS_REGISTER_URL}>Register on Afterhours</PillLink>
      </div>
      <div
        style={{
          position: 'relative',
          background: 'radial-gradient(ellipse 80% 70% at 50% 60%, rgba(255,63,194,0.1), transparent 75%), #070707',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '40px 30px 0',
        }}
      >
        <div style={{ width: 180, height: 240, background: '#101014', border: '2px solid var(--border-strong)', borderBottom: 'none', borderRadius: '28px 28px 0 0', padding: '20px 16px' }}>
          <Image src="/images/brand/afterhours-logo.webp" alt="Afterhours" width={44} height={44} style={{ borderRadius: 10, margin: '0 auto 12px', display: 'block' }} />
          <div style={{ background: 'var(--accent-faint)', border: '1px solid var(--accent-soft)', borderRadius: 10, padding: 10, marginBottom: 8 }}>
            <p style={{ fontSize: 10, margin: 0, color: '#fff' }}>SonicPulse Festival</p>
            <p style={{ fontSize: 8.5, margin: 0, color: 'var(--accent-magenta)' }}>Early Bird — on sale</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 26, marginBottom: 7 }} />
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 26, marginBottom: 7 }} />
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 26, width: '70%' }} />
        </div>
      </div>
    </div>
  )
}
