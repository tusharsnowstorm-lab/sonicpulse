import Link from 'next/link'
import { artists } from '@/data/artists'
import Badge from '@/components/ui/Badge'

const featured = artists.slice(0, 4)

export default function ArtistTeaser() {
  return (
    <section className="py-12 md:py-20 px-4" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p
              className="text-[10px] tracking-[0.3em] uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              The Artists
            </p>
            <h2
              className="text-2xl md:text-3xl font-black glow-heading"
              style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
            >
              FEATURED ACTS
            </h2>
          </div>
          <Link
            href="/lineup"
            className="text-xs tracking-widest uppercase transition-colors duration-150 whitespace-nowrap"
            style={{ color: 'var(--accent-electric)', fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            See Full Lineup →
          </Link>
        </div>

        {/* Mobile: horizontal scroll  |  Desktop: grid */}
        <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-2 md:overflow-visible md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {featured.map((artist) => (
            <Link
              key={artist.id}
              href="/lineup"
              className="shrink-0 w-48 md:w-auto group"
            >
              <div
                className="aspect-square rounded-[4px] flex items-center justify-center mb-3 transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                <span
                  className="text-3xl font-black"
                  style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--accent-electric)', opacity: 0.6 }}
                >
                  {artist.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <p className="font-bold text-sm text-[var(--text-primary)] mb-1">{artist.name}</p>
              <div className="flex items-center gap-2">
                <Badge variant={artist.stage === 'main' ? 'stage-main' : 'stage-sunrise'}>
                  {artist.stage === 'main' ? 'Main' : 'Sunrise'}
                </Badge>
                <span className="text-[10px] text-[var(--text-muted)]">{artist.genre}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
