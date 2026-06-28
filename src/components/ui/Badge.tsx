type BadgeVariant = 'stage-main' | 'stage-sunrise' | 'tier-highlight' | 'tier-last' | 'status-available' | 'status-selling' | 'status-sold' | 'live'

const styles: Record<BadgeVariant, string> = {
  'stage-main':      'bg-[rgba(204,255,0,0.12)] text-[var(--accent-volt)] border border-[rgba(204,255,0,0.3)]',
  'stage-sunrise':   'bg-[rgba(0,240,255,0.12)] text-[var(--accent-electric)] border border-[rgba(0,240,255,0.3)]',
  'tier-highlight':  'bg-[var(--accent-volt)] text-[var(--bg-void)]',
  'tier-last':       'bg-[var(--accent-pulse)] text-white',
  'status-available':'bg-[rgba(0,240,255,0.1)] text-[var(--accent-electric)]',
  'status-selling':  'bg-[rgba(255,45,107,0.1)] text-[var(--accent-pulse)]',
  'status-sold':     'bg-[rgba(107,107,126,0.2)] text-[var(--text-muted)]',
  'live':            'bg-[var(--accent-pulse)] text-white',
}

type BadgeProps = {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold tracking-widest uppercase font-[family-name:var(--font-jetbrains-mono)] ${styles[variant]} ${className}`}
    >
      {variant === 'live' && <span className="pulse-dot w-1.5 h-1.5" />}
      {children}
    </span>
  )
}
