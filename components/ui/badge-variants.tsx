import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Telos.AI Badge Variants
 *
 * Semantic badges for status indicators, labels, and tags.
 * All badges meet WCAG AA contrast requirements.
 *
 * @example
 * <StatusBadge status="active">Ativo</StatusBadge>
 * <RiskBadge risk="high">Alto Risco</RiskBadge>
 * <ResearchBadge groupCode="A">Grupo A</ResearchBadge>
 */

// ============================================================================
// BASE BADGE VARIANTS
// ============================================================================

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        primary: "bg-telos-blue-500 text-white hover:bg-telos-blue-600",
        secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
        success: "bg-telos-success-500 text-white hover:bg-telos-success-600",
        warning: "bg-telos-warning-500 text-white hover:bg-telos-warning-600",
        error: "bg-telos-error-500 text-white hover:bg-telos-error-600",
        info: "bg-telos-info-500 text-white hover:bg-telos-info-600",
        gold: "bg-telos-gold-500 text-telos-blue-900 hover:bg-telos-gold-600 border-2 border-telos-gold-600",
        purple: "bg-telos-purple-500 text-white hover:bg-telos-purple-600",
        outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50",
        outlinePrimary: "border-2 border-telos-blue-500 text-telos-blue-500 hover:bg-telos-blue-50",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// ============================================================================
// BASE BADGE COMPONENT
// ============================================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {}

export function Badge({
  variant,
  size,
  className,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// ============================================================================
// STATUS BADGE
// ============================================================================

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "active" | "inactive" | "pending" | "completed" | "cancelled"
  showIcon?: boolean
}

export function StatusBadge({
  status,
  showIcon = true,
  size = "md",
  children,
  className,
  ...props
}: StatusBadgeProps) {
  const config = {
    active: {
      variant: "success" as const,
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      label: "Ativo",
    },
    inactive: {
      variant: "secondary" as const,
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" opacity="0.4" />
        </svg>
      ),
      label: "Inativo",
    },
    pending: {
      variant: "warning" as const,
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Pendente",
    },
    completed: {
      variant: "primary" as const,
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      label: "Concluído",
    },
    cancelled: {
      variant: "error" as const,
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      label: "Cancelado",
    },
  }

  const { variant, icon, label } = config[status]

  return (
    <Badge variant={variant} size={size} className={className} {...props}>
      {showIcon && icon}
      {children || label}
    </Badge>
  )
}

// ============================================================================
// RISK BADGE
// ============================================================================

interface RiskBadgeProps extends Omit<BadgeProps, "variant"> {
  risk: "low" | "medium" | "high" | "critical"
  showIcon?: boolean
}

export function RiskBadge({
  risk,
  showIcon = true,
  size = "md",
  children,
  className,
  ...props
}: RiskBadgeProps) {
  const config = {
    low: {
      variant: "success" as const,
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Baixo Risco",
    },
    medium: {
      variant: "warning" as const,
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      label: "Médio Risco",
    },
    high: {
      variant: "error" as const,
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      ),
      label: "Alto Risco",
    },
    critical: {
      variant: "error" as const,
      icon: (
        <svg className="h-3 w-3 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z" />
        </svg>
      ),
      label: "Risco Crítico",
    },
  }

  const { variant, icon, label } = config[risk]

  return (
    <Badge variant={variant} size={size} className={cn("font-bold", className)} {...props}>
      {showIcon && icon}
      {children || label}
    </Badge>
  )
}

// ============================================================================
// RESEARCH BADGE
// ============================================================================

interface ResearchBadgeProps extends Omit<BadgeProps, "variant"> {
  groupCode?: string
  showIcon?: boolean
}

export function ResearchBadge({
  groupCode,
  showIcon = true,
  size = "md",
  children,
  className,
  ...props
}: ResearchBadgeProps) {
  return (
    <Badge variant="purple" size={size} className={cn("font-semibold", className)} {...props}>
      {showIcon && (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )}
      {children || (groupCode ? `Grupo ${groupCode}` : "Pesquisa")}
    </Badge>
  )
}

// ============================================================================
// POST-OP DAY BADGE
// ============================================================================

interface PostOpDayBadgeProps extends Omit<BadgeProps, "variant"> {
  day: number
}

export function PostOpDayBadge({
  day,
  size = "md",
  className,
  ...props
}: PostOpDayBadgeProps) {
  // Color coding based on post-op phase
  const variant = day <= 7 ? "error" : day <= 14 ? "warning" : day <= 30 ? "info" : "success"

  return (
    <Badge variant={variant} size={size} className={cn("font-semibold", className)} {...props}>
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      D+{day}
    </Badge>
  )
}

// ============================================================================
// NEW BADGE (Premium Gold)
// ============================================================================

interface NewBadgeProps extends Omit<BadgeProps, "variant"> {
  pulse?: boolean
}

export function NewBadge({
  pulse = true,
  size = "sm",
  className,
  children = "NOVO",
  ...props
}: NewBadgeProps) {
  return (
    <Badge
      variant="gold"
      size={size}
      className={cn(
        "font-extrabold shadow-md",
        pulse && "animate-pulse",
        className
      )}
      style={{
        boxShadow: "0 2px 8px rgba(212, 175, 55, 0.3)",
      }}
      {...props}
    >
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      {children}
    </Badge>
  )
}

// ============================================================================
// COMPLETENESS BADGE
// ============================================================================

interface CompletenessBadgeProps extends Omit<BadgeProps, "variant"> {
  percentage: number
  showPercentage?: boolean
}

export function CompletenessBadge({
  percentage,
  showPercentage = true,
  size = "md",
  className,
  ...props
}: CompletenessBadgeProps) {
  const variant = percentage >= 80 ? "success" : percentage >= 40 ? "warning" : "error"

  const icon = percentage === 100 ? (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  ) : (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  return (
    <Badge variant={variant} size={size} className={cn("font-bold", className)} {...props}>
      {icon}
      {showPercentage ? `${percentage}%` : percentage === 100 ? "Completo" : "Incompleto"}
    </Badge>
  )
}

// ============================================================================
// COUNT BADGE (for notifications)
// ============================================================================

interface CountBadgeProps extends Omit<BadgeProps, "variant" | "size"> {
  count: number
  max?: number
  showZero?: boolean
}

export function CountBadge({
  count,
  max = 99,
  showZero = false,
  className,
  ...props
}: CountBadgeProps) {
  if (!showZero && count === 0) return null

  const displayCount = count > max ? `${max}+` : count

  return (
    <Badge
      variant="error"
      size="sm"
      className={cn(
        "min-w-5 h-5 flex items-center justify-center p-0 text-xs font-bold",
        className
      )}
      {...props}
    >
      {displayCount}
    </Badge>
  )
}

// ============================================================================
// SURGERY TYPE BADGE
// ============================================================================

interface SurgeryTypeBadgeProps extends Omit<BadgeProps, "variant"> {
  type: "hemorroidectomia" | "fistula" | "fissura" | "pilonidal" | "other"
}

export function SurgeryTypeBadge({
  type,
  size = "md",
  className,
  ...props
}: SurgeryTypeBadgeProps) {
  const config = {
    hemorroidectomia: {
      variant: "primary" as const,
      label: "Hemorroidectomia",
    },
    fistula: {
      variant: "info" as const,
      label: "Fístula",
    },
    fissura: {
      variant: "warning" as const,
      label: "Fissura",
    },
    pilonidal: {
      variant: "purple" as const,
      label: "Pilonidal",
    },
    other: {
      variant: "default" as const,
      label: "Outro",
    },
  }

  const { variant, label } = config[type]

  return (
    <Badge variant={variant} size={size} className={className} {...props}>
      {label}
    </Badge>
  )
}

// ============================================================================
// TRENDING BADGE
// ============================================================================

interface TrendingBadgeProps extends Omit<BadgeProps, "variant"> {
  trend: "up" | "down" | "neutral"
  value?: number
}

export function TrendingBadge({
  trend,
  value,
  size = "sm",
  className,
  ...props
}: TrendingBadgeProps) {
  const config = {
    up: {
      variant: "success" as const,
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    down: {
      variant: "error" as const,
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      ),
    },
    neutral: {
      variant: "secondary" as const,
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      ),
    },
  }

  const { variant, icon } = config[trend]

  return (
    <Badge variant={variant} size={size} className={className} {...props}>
      {icon}
      {value !== undefined && `${value > 0 ? '+' : ''}${value}%`}
    </Badge>
  )
}
