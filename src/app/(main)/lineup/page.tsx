import type { Metadata } from 'next'
import { artists } from '@/data/artists'
import ArtistGrid from '@/components/lineup/ArtistGrid'

export const metadata: Metadata = {
  title: 'Lineup — Sonic Pulse',
  description: `${artists.length} artists. Two stages. One night.`,
}

export default function LineupPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-12 md:py-20">
      {/* Header */}
      <div className="mb-12">
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Sonic Pulse 2025
        </p>
        <h1
          className="text-4xl md:text-5xl font-black glow-heading"
          style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
        >
          THE LINEUP
        </h1>
        <p className="mt-2 text-[var(--text-muted)] text-sm">
          {artists.length} Artists · Two Stages · 15 November 2025
        </p>
      </div>

      <ArtistGrid />
    </div>
  )
}
