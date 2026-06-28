import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { SetSlot } from '@/data/schedule'

type Props = { slot: SetSlot; isLive?: boolean }

export default function SetRow({ slot, isLive }: Props) {
  return (
    <Link
      href={`/lineup#${slot.artistId}`}
      className="flex items-center gap-4 py-4 px-4 rounded-[4px] transition-colors duration-150 group"
      style={{
        background: isLive ? 'rgba(0,240,255,0.05)' : 'transparent',
        borderLeft: isLive ? '2px solid var(--accent-electric)' : '2px solid transparent',
      }}
    >
      {/* Time */}
      <span
        className="w-14 shrink-0 text-sm font-bold tabular-nums"
        style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--accent-electric)' }}
      >
        {slot.time}
      </span>

      {/* Artist info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isLive && <Badge variant="live">LIVE</Badge>}
          <span
            className="font-bold text-[var(--text-primary)] text-sm truncate group-hover:text-[var(--accent-electric)] transition-colors duration-150"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {slot.artist}
          </span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{slot.genre}</span>
      </div>

      {/* Duration */}
      <span
        className="shrink-0 text-[10px] text-[var(--text-muted)]"
        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        {slot.duration}m
      </span>
    </Link>
  )
}
