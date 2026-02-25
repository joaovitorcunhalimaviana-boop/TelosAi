import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * VigIA Card Variants
 *
 * Standardized card components with consistent styling, shadows, and interactions.
 * Use these instead of base Card for better visual consistency.
 *
 * @example
 * <InteractiveCard onClick={handleClick}>
 *   <CardContent>Click me!</CardContent>
 * </InteractiveCard>
 *
 * <ElevatedCard>
 *   <CardContent>I have more shadow!</CardContent>
 * </ElevatedCard>
 */

// ============================================================================
// CARD VARIANTS
// ============================================================================

const cardVariants = cva(
  "rounded-xl border bg-white text-gray-900 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-gray-200 shadow-sm",
        elevated: "border-gray-200 shadow-md hover:shadow-lg",
        bordered: "border-2 border-vigia-teal-200 shadow-none",
        interactive: "border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer",
        success: "border-vigia-success-200 bg-vigia-success-50 shadow-sm",
        warning: "border-vigia-warning-200 bg-vigia-warning-50 shadow-sm",
        error: "border-vigia-error-200 bg-vigia-error-50 shadow-sm",
        gold: "border-vigia-gold-300 bg-gradient-to-br from-white to-vigia-gold-50 shadow-md",
        glass: "border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-lg",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
)

// ============================================================================
// BASE CARD
// ============================================================================

interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {}

export function BaseCard({
  variant,
  padding,
  className,
  ...props
}: BaseCardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
}

// ============================================================================
// INTERACTIVE CARD
// ============================================================================

interface InteractiveCardProps extends BaseCardProps {
  onClick?: () => void
  href?: string
}

export function InteractiveCard({
  onClick,
  href,
  className,
  children,
  ...props
}: InteractiveCardProps) {
  const Component = href ? "a" : "div"

  return (
    <Component
      className={cn(
        cardVariants({ variant: "interactive" }),
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigia-teal-500 focus-visible:ring-offset-2",
        className
      )}
      onClick={onClick}
      {...(href && { href })}
      {...(props as any)}
    >
      {children}
    </Component>
  )
}

// ============================================================================
// ELEVATED CARD
// ============================================================================

export function ElevatedCard({ className, ...props }: BaseCardProps) {
  return (
    <BaseCard
      variant="elevated"
      className={className}
      {...props}
    />
  )
}

// ============================================================================
// STAT CARD
// ============================================================================

interface StatCardProps extends Omit<BaseCardProps, "variant"> {
  icon?: React.ReactNode
  label: string
  value: string | number
  change?: {
    value: number
    trend: "up" | "down" | "neutral"
  }
  variant?: "default" | "success" | "warning" | "error" | "gold"
}

export function StatCard({
  icon,
  label,
  value,
  change,
  variant = "default",
  className,
  ...props
}: StatCardProps) {
  const trendIcon = {
    up: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    down: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    neutral: null,
  }

  const trendColor = {
    up: "text-vigia-success-500",
    down: "text-vigia-error-500",
    neutral: "text-gray-500",
  }

  return (
    <BaseCard
      variant={variant}
      className={cn("space-y-3", className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {icon && (
          <div className="p-2 bg-vigia-teal-50 rounded-lg text-vigia-teal-500">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-bold text-gray-900">{value}</div>

        {change && (
          <div className={cn("flex items-center gap-1 text-sm font-medium", trendColor[change.trend])}>
            {trendIcon[change.trend]}
            <span>{Math.abs(change.value)}%</span>
            <span className="text-gray-500 font-normal">vs último período</span>
          </div>
        )}
      </div>
    </BaseCard>
  )
}

// ============================================================================
// PATIENT CARD
// ============================================================================

interface PatientCardProps extends Omit<BaseCardProps, "variant"> {
  patientName: string
  surgeryType: string
  postOpDay: number
  riskLevel?: "low" | "medium" | "high"
  status?: "active" | "pending" | "completed"
  onClick?: () => void
}

export function PatientCard({
  patientName,
  surgeryType,
  postOpDay,
  riskLevel,
  status = "active",
  onClick,
  className,
  ...props
}: PatientCardProps) {
  const riskColors = {
    low: "bg-vigia-success-500",
    medium: "bg-vigia-warning-500",
    high: "bg-vigia-error-500",
  }

  const statusColors = {
    active: "bg-vigia-success-500",
    pending: "bg-vigia-warning-500",
    completed: "bg-gray-500",
  }

  return (
    <InteractiveCard
      onClick={onClick}
      className={cn("space-y-4", className)}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg text-gray-900">{patientName}</h3>
          <p className="text-sm text-gray-600">{surgeryType}</p>
        </div>

        {riskLevel && (
          <div className={cn("w-3 h-3 rounded-full", riskColors[riskLevel])} />
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className={cn("px-2 py-1 rounded-full text-white text-xs font-medium", statusColors[status])}>
            {status === "active" && "Ativo"}
            {status === "pending" && "Pendente"}
            {status === "completed" && "Concluído"}
          </div>

          <div className="px-2 py-1 bg-vigia-teal-50 rounded-full text-vigia-teal-700 text-xs font-medium">
            D+{postOpDay}
          </div>
        </div>
      </div>
    </InteractiveCard>
  )
}

// ============================================================================
// FEATURE CARD
// ============================================================================

interface FeatureCardProps extends Omit<BaseCardProps, "variant"> {
  icon: React.ReactNode
  title: string
  description: string
  highlighted?: boolean
}

export function FeatureCard({
  icon,
  title,
  description,
  highlighted = false,
  className,
  ...props
}: FeatureCardProps) {
  return (
    <BaseCard
      variant={highlighted ? "gold" : "elevated"}
      className={cn("group space-y-4", className)}
      {...props}
    >
      <div className="p-3 bg-vigia-teal-50 rounded-xl w-fit group-hover:bg-vigia-teal-500 transition-colors">
        <div className="text-vigia-teal-500 group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>

      {highlighted && (
        <div className="flex items-center gap-2 text-vigia-gold-600 font-medium text-sm">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Recurso Premium
        </div>
      )}
    </BaseCard>
  )
}

// ============================================================================
// EMPTY STATE CARD
// ============================================================================

interface EmptyStateCardProps extends Omit<BaseCardProps, "variant"> {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateCardProps) {
  return (
    <BaseCard
      variant="default"
      className={cn("text-center space-y-6 py-12", className)}
      {...props}
    >
      {icon && (
        <div className="flex justify-center">
          <div className="p-4 bg-gray-100 rounded-full text-gray-400">
            {icon}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 max-w-md mx-auto">{description}</p>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-vigia-teal-500 text-white rounded-lg hover:bg-vigia-teal-600 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </BaseCard>
  )
}

// ============================================================================
// RESEARCH CARD
// ============================================================================

interface ResearchCardProps extends Omit<BaseCardProps, "variant"> {
  title: string
  description: string
  participantCount: number
  groupCount: number
  isActive: boolean
  onClick?: () => void
}

export function ResearchCard({
  title,
  description,
  participantCount,
  groupCount,
  isActive,
  onClick,
  className,
  ...props
}: ResearchCardProps) {
  return (
    <InteractiveCard
      onClick={onClick}
      className={cn("space-y-4", className)}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
            {isActive ? (
              <div className="px-2 py-1 bg-vigia-success-500 text-white text-xs font-medium rounded-full">
                Ativo
              </div>
            ) : (
              <div className="px-2 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
                Inativo
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-vigia-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-gray-600">{participantCount} participantes</span>
        </div>

        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-vigia-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-gray-600">{groupCount} grupos</span>
        </div>
      </div>
    </InteractiveCard>
  )
}
