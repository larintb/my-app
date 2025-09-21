import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border p-6 shadow-lg',
      className
    )}
    style={{
      borderColor: 'var(--border-color)',
      backgroundColor: 'var(--bg-secondary)',
    }}
    {...props}
  >
    {children}
  </div>
))

Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-6', className)}
    {...props}
  />
))

CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(({
  className,
  ...props
}, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-semibold leading-none tracking-tight', className)}
    style={{ color: 'var(--text-primary)' }}
    {...props}
  />
))

CardTitle.displayName = 'CardTitle'

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(({
  className,
  ...props
}, ref) => (
  <p
    ref={ref}
    className={cn('text-sm', className)}
    style={{ color: 'var(--text-secondary)' }}
    {...props}
  />
))

CardDescription.displayName = 'CardDescription'

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({
  className,
  ...props
}, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
))

CardContent.displayName = 'CardContent'

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
}