import Link from 'next/link'
import Image from 'next/image'
import { Artist } from '@/data/artists'
import Badge from '@/components/ui/Badge'

type Props = { artist: Artist; large?: boolean }

export default function ArtistCard({ artist, large = false }: Props) {
  return (
    <div
      className={`group rounded-[4px] overflow-hidden transition-all duration-200 cursor-pointer
        hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(0,240,255,0.15)]`}
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      {/* Photo */}
      <div
        className={`relative ${large ? 'aspect-[4/3]' : 'aspect-square'} bg-[var(--bg-elevated)]`}
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {artist.image ? (
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            sizes={large ? '(max-width:768px) 100vw, 50vw' : '(max-width:768px) 50vw, 25vw'}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span
              className={`font-black ${large ? 'text-6xl' : 'text-4xl'} opacity-40`}
              style={{ fontFamily: 'var(--font-montserrat)', color: 'var(--accent-electric)' }}
            >
              {artist.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className={`font-bold text-[var(--text-primary)] ${large ? 'text-xl' : 'text-sm'} leading-tight`}
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {artist.name}
          </h3>
          {artist.isHeadliner && (
            <Badge variant="tier-last">Headliner</Badge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={artist.stage === 'main' ? 'stage-main' : 'stage-sunrise'}>
            {artist.stage === 'main' ? 'Main Stage' : 'Sunrise Stage'}
          </Badge>
          <span className="text-[10px] text-[var(--text-muted)]">{artist.genre}</span>
        </div>

        {artist.setTime && (
          <p
            className="mt-2 text-[10px] tracking-widest"
            style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--accent-electric)' }}
          >
            {artist.setTime}
          </p>
        )}

        {large && artist.bio && (
          <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">{artist.bio}</p>
        )}

        {large && artist.socialLink && (
          <Link
            href={artist.socialLink}
            className="inline-block mt-3 text-xs tracking-widest uppercase transition-colors duration-150"
            style={{ color: 'var(--accent-electric)', fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            Follow →
          </Link>
        )}
      </div>
    </div>
  )
}
