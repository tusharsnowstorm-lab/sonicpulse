import { APP_DISCOUNT, APP_NAME } from '@/data/tickets'
import PillButton from './PillButton'

/** "Save ৳1,000 on every tier" panel promoting the Afterhours app discount. */
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
          Save ৳{APP_DISCOUNT.toLocaleString()} on every tier.
        </h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '12px 0 30px', maxWidth: 340, lineHeight: 1.65 }}>
          Book inside the <span style={{ color: 'var(--accent-magenta)', fontWeight: 600 }}>{APP_NAME} app</span> and every ticket drops by ৳{APP_DISCOUNT.toLocaleString()}. Same tiers, same night.
        </p>
        <PillButton>Get the app</PillButton>
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
          <p style={{ fontSize: 8, letterSpacing: '0.28em', color: 'var(--accent-magenta)', textAlign: 'center', marginBottom: 14 }}>
            {APP_NAME.toUpperCase()}
          </p>
          <div style={{ background: 'var(--accent-faint)', border: '1px solid var(--accent-soft)', borderRadius: 10, padding: 10, marginBottom: 8 }}>
            <p style={{ fontSize: 10, margin: 0, color: '#fff' }}>Rhythm — ৳5,500</p>
            <p style={{ fontSize: 8.5, margin: 0, color: 'var(--accent-magenta)' }}>You save ৳{APP_DISCOUNT.toLocaleString()}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 26, marginBottom: 7 }} />
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 26, marginBottom: 7 }} />
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 26, width: '70%' }} />
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 720px) {
          .app-promo-band {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
