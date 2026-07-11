'use client'
import { forwardRef } from 'react'
import Link from 'next/link'

type Variant = 'primary' | 'ghost' | 'outline'

type CommonProps = {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

type ButtonAsLink = CommonProps & React.ComponentPropsWithoutRef<typeof Link>


const base: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontFamily: 'var(--font-montserrat)',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  touchAction: 'manipulation',
  border: 'none',
  transition: 'opacity 0.15s ease, transform 0.1s ease',
}

const variants: Record<Variant, React.CSSProperties> = {
  primary: {
    background: '#fff',
    color: '#000',
    borderRadius: 'var(--radius-pill)',
    padding: '15px 38px',
  },
  outline: {
    background: 'transparent',
    color: '#fff',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-pill)',
    padding: '13px 34px',
  },
  ghost: {
    background: 'transparent',
    color: '#fff',
    padding: '15px 4px',
  },
}

/** Primary white pill / outline pill / ghost text CTA — the only button shapes on public pages. */
const PillButton = forwardRef<HTMLButtonElement, ButtonAsButton>(
  ({ variant = 'primary', children, className = '', style, ...props }, ref) => (
    <button ref={ref} className={className} style={{ ...base, ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  )
)
PillButton.displayName = 'PillButton'

export function PillLink({ variant = 'primary', children, className = '', href, style, ...props }: ButtonAsLink) {
  return (
    <Link href={href} className={className} style={{ ...base, ...variants[variant], ...style }} {...props}>
      {children}
    </Link>
  )
}

export default PillButton
