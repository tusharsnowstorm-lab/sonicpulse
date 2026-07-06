import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { SetSlot } from '@/data/schedule'

type Props = { slot: SetSlot; isLive?: boolean }

export default function SetRow({ slot, isLive }: Props) {
  const isTba = !slot.published || slot.artistId.startsWith('tba')

  const inner = (
    <div
      className="flex items-center gap-4 py-4 px-4 rounded-[4px] transition-colors duration-150 group"
      style={{
        background: isLive ? 'rgba(255,63,194,0.06)' : 'transparent',
        borderLeft: isLive ? '2px solid var(--accent-magenta)' : '2px solid transparent',
        opacity: isTba ? 0.45 : 1,
      }}
    >
      {/* Time */}
      <span
        className="w-14 shrink-0 text-sm font-bold tabular-nums"
        style={{ fontFamily: 'var(--font-jetbrains-mono)', color: isTba ? 'var(--text-muted)' : 'var(--accent-magenta)' }}
      >
        {slot.time}
      </span>

      {/* Artist info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isLive && <Badge variant="live">LIVE</Badge>}
          <span
            className="font-bold text-sm truncate"
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              color: isTba ? 'var(--text-muted)' : 'var(--text-primary)',
            }}
          >
            {isTba ? 'TBA' : slot.artist}
          </span>
        </div>
        {!isTba && slot.genre && (
          <span className="text-xs text-[var(--text-muted)]">{slot.genre}</span>
        )}
      </div>

      {/* Duration */}
      <span
        className="shrink-0 text-[10px] text-[var(--text-muted)]"
        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        {slot.duration}m
      </span>
    </div>
  )

  if (isTba) return inner

  return (
    <Link
      href={`/lineup#${slot.artistId}`}
      className="block hover:bg-[rgba(255,63,194,0.04)] rounded-[4px] transition-colors duration-150"
    >
      {inner}
    </Link>
  )
}
