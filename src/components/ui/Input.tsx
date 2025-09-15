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
          className="mb-2 block text-sm font-medium text-gray-200"
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
          'w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2.5 text-base text-gray-100',
          'placeholder:text-gray-400',
          'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          'disabled:cursor-not-allowed disabled:bg-gray-900 disabled:text-gray-500',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}

      {helper && !error && (
        <p className="mt-1 text-sm text-gray-400">
          {helper}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }