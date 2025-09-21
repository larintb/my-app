import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = 'text',
  label,
  error,
  helper,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
          {props.required && <span className="ml-1 text-red-400">*</span>}
        </label>
      )}

      <input
        type={type}
        id={inputId}
        ref={ref}
        className={cn(
          'w-full rounded-lg border px-3 py-2.5 text-base transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-green-500/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        style={{
          borderColor: error ? '#ef4444' : 'var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          ...(props.style || {})
        }}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}

      {helper && !error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {helper}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }