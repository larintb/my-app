import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100 rounded-lg shadow-lg'

  const variants = {
    primary: 'primary-button text-black font-bold focus-visible:ring-green-500',
    secondary: 'text-white hover:opacity-90 focus-visible:ring-green-500',
    outline: 'border border-green-500 bg-transparent hover:bg-green-50 text-green-600 hover:text-green-700',
    ghost: 'hover:opacity-90',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
  }

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-12 px-6 text-lg'
  }

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#1DB954',
          color: 'black',
        }
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }
      case 'ghost':
        return {
          color: 'var(--text-primary)',
        }
      default:
        return {}
    }
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      style={getButtonStyle()}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }