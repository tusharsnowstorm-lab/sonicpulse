'use client'
import { useState } from 'react'
import { artists, headliners } from '@/data/artists'
import ArtistCard from './ArtistCard'
import StageFilter, { StageFilter as StageFilterType } from './StageFilter'

export default function ArtistGrid() {
  const [filter, setFilter] = useState<StageFilterType>('all')

  const filtered = artists.filter((a) => {
    if (filter === 'all') return true
    return a.stage === filter
  })

  return (
    <div>
      {/* Headliners spotlight */}
      {(filter === 'all' || headliners.some((h) => h.stage === filter)) && (
        <section className="mb-12">
          <h2
            className="text-xs font-bold tracking-[0.3em] uppercase mb-6"
            style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--accent-volt)' }}
          >
            — Headliners
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {headliners
              .filter((a) => filter === 'all' || a.stage === filter)
              .map((artist) => (
                <ArtistCard key={artist.id} artist={artist} large />
              ))}
          </div>
        </section>
      )}

      {/* Filter */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <h2
          className="text-xs font-bold tracking-[0.3em] uppercase"
          style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--text-muted)' }}
        >
          — All Artists
        </h2>
        <StageFilter active={filter} onChange={setFilter} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered
          .filter((a) => !a.isHeadliner)
          .map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
      </div>
    </div>
  )
}
