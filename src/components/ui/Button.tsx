'use client'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const styles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--accent-magenta)] text-white font-semibold
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
  secondary: `
    bg-transparent text-white border border-[var(--border-strong)] font-semibold
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent text-[rgba(255,255,255,0.45)] hover:text-white font-semibold
    transition-colors duration-200
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-full cursor-pointer font-[family-name:var(--font-montserrat)] ${styles[variant]} ${sizes[size]} ${className}`}
        style={{ touchAction: 'manipulation' }}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
