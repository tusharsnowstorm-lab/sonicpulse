'use client'
import { useState } from 'react'
import { artists, headliners } from '@/data/artists'
import ArtistCard from './ArtistCard'
import StageFilter, { StageFilter as StageFilterType } from './StageFilter'

const published = artists.filter((a) => a.published)
const publishedHeadliners = headliners.filter((a) => a.published)

export default function ArtistGrid() {
  const [filter, setFilter] = useState<StageFilterType>('all')

  const filtered = published.filter((a) => {
    if (filter === 'all') return true
    return a.stage === filter
  })

  return (
    <div>
      {/* Headliners spotlight */}
      {(filter === 'all' || publishedHeadliners.some((h) => h.stage === filter)) && (
        <section className="mb-12">
          <h2
            className="text-xs font-bold tracking-[0.3em] uppercase mb-6"
            style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--text-muted)' }}
          >
            — Headliners
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedHeadliners
              .filter((a) => filter === 'all' || a.stage === filter)
              .map((artist) => (
                <ArtistCard key={artist.id} artist={artist} large />
              ))}
          </div>
        </section>
      )}

      {/* Non-headliner published artists */}
      {filtered.filter((a) => !a.isHeadliner).length > 0 && (
        <>
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <h2
              className="text-xs font-bold tracking-[0.3em] uppercase"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--text-muted)' }}
            >
              — All Artists
            </h2>
            <StageFilter active={filter} onChange={setFilter} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered
              .filter((a) => !a.isHeadliner)
              .map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
          </div>
        </>
      )}

      {/* More artists coming soon teaser */}
      <div
        className="mt-10 rounded-2xl px-6 py-5 text-center"
        style={{ background: 'rgba(255,63,194,0.04)', border: '1px dashed rgba(255,63,194,0.2)' }}
      >
        <p
          className="text-xs tracking-[0.25em] uppercase mb-1"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          More artists dropping soon
        </p>
        <p className="text-sm" style={{ color: 'rgba(240,240,248,0.5)' }}>
          Follow <span style={{ color: 'var(--accent-magenta)' }}>@sonicpulsefestival</span> for announcements
        </p>
      </div>
    </div>
  )
}
