import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Typography Components for VigIA Design System
 *
 * Consistent, semantic typography components with proper hierarchy
 * and accessibility built-in.
 *
 * @example
 * <Heading level={1}>Page Title</Heading>
 * <Body>This is body text with proper line height.</Body>
 * <Caption>Last updated 2 hours ago</Caption>
 */

// ============================================================================
// HEADING COMPONENT
// ============================================================================

const headingVariants = cva("font-semibold text-vigia-teal-500", {
  variants: {
    level: {
      1: "text-4xl lg:text-5xl leading-tight tracking-tight",
      2: "text-3xl lg:text-4xl leading-tight",
      3: "text-2xl lg:text-3xl leading-snug",
      4: "text-xl lg:text-2xl leading-snug",
      5: "text-lg lg:text-xl leading-normal",
      6: "text-base lg:text-lg leading-normal",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    },
  },
  defaultVariants: {
    level: 1,
    weight: "semibold",
  },
})

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>,
  VariantProps<typeof headingVariants> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div"
}

export function Heading({
  level = 1,
  as,
  weight,
  className,
  children,
  ...props
}: HeadingProps) {
  const Component = as || (`h${level}` as keyof React.JSX.IntrinsicElements)

  return (
    <Component
      className={cn(headingVariants({ level, weight }), className)}
      {...(props as any)}
    >
      {children}
    </Component>
  )
}

// ============================================================================
// SUBHEADING COMPONENT
// ============================================================================

const subheadingVariants = cva("text-[#D8DEEB] leading-relaxed", {
  variants: {
    size: {
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    size: "base",
  },
})

interface SubheadingProps extends React.HTMLAttributes<HTMLParagraphElement>,
  VariantProps<typeof subheadingVariants> {
  as?: "p" | "div" | "span"
}

export function Subheading({
  size,
  as: Component = "p",
  className,
  children,
  ...props
}: SubheadingProps) {
  return (
    <Component
      className={cn(subheadingVariants({ size }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// ============================================================================
// BODY COMPONENT
// ============================================================================

const bodyVariants = cva("text-[#D8DEEB] leading-relaxed", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
  },
  defaultVariants: {
    size: "base",
    weight: "normal",
  },
})

interface BodyProps extends React.HTMLAttributes<HTMLParagraphElement>,
  VariantProps<typeof bodyVariants> {
  as?: "p" | "div" | "span"
}

export function Body({
  size,
  weight,
  as: Component = "p",
  className,
  children,
  ...props
}: BodyProps) {
  return (
    <Component
      className={cn(bodyVariants({ size, weight }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// ============================================================================
// CAPTION COMPONENT
// ============================================================================

const captionVariants = cva("text-[#7A8299]", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
    },
  },
  defaultVariants: {
    size: "sm",
    weight: "normal",
  },
})

interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof captionVariants> {
  as?: "span" | "p" | "div"
}

export function Caption({
  size,
  weight,
  as: Component = "span",
  className,
  children,
  ...props
}: CaptionProps) {
  return (
    <Component
      className={cn(captionVariants({ size, weight }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// ============================================================================
// LABEL COMPONENT
// ============================================================================

const labelVariants = cva("font-medium text-[#D8DEEB]", {
  variants: {
    size: {
      sm: "text-sm",
      base: "text-base",
    },
    required: {
      true: "after:content-['*'] after:ml-1 after:text-vigia-error-500",
    },
  },
  defaultVariants: {
    size: "sm",
  },
})

interface LabelTextProps extends React.HTMLAttributes<HTMLLabelElement>,
  VariantProps<typeof labelVariants> {
  htmlFor?: string
}

export function LabelText({
  size,
  required,
  htmlFor,
  className,
  children,
  ...props
}: LabelTextProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(labelVariants({ size, required }), className)}
      {...props}
    >
      {children}
    </label>
  )
}

// ============================================================================
// LINK COMPONENT
// ============================================================================

const linkVariants = cva(
  "transition-colors duration-200 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigia-teal-500 focus-visible:ring-offset-2 rounded-sm",
  {
    variants: {
      variant: {
        default: "text-vigia-teal-500 hover:text-vigia-teal-600 underline",
        subtle: "text-[#D8DEEB] hover:text-vigia-teal-500 hover:underline",
        gold: "text-vigia-gold-500 hover:text-vigia-gold-600 underline",
        destructive: "text-vigia-error-500 hover:text-vigia-error-600 underline",
      },
      size: {
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "base",
    },
  }
)

interface LinkTextProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
  VariantProps<typeof linkVariants> {
  external?: boolean
}

export function LinkText({
  variant,
  size,
  external = false,
  className,
  children,
  ...props
}: LinkTextProps) {
  return (
    <a
      className={cn(linkVariants({ variant, size }), className)}
      {...(external && {
        target: "_blank",
        rel: "noopener noreferrer",
      })}
      {...props}
    >
      {children}
      {external && (
        <svg
          className="inline-block ml-1 h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </a>
  )
}

// ============================================================================
// CODE COMPONENT
// ============================================================================

const codeVariants = cva(
  "font-mono rounded px-1.5 py-0.5",
  {
    variants: {
      variant: {
        default: "bg-[#0B0E14] text-[#F0EAD6] border border-[#1E2535]",
        primary: "bg-vigia-teal-50 text-vigia-teal-700 border border-vigia-teal-200",
        success: "bg-vigia-success-50 text-vigia-success-700 border border-vigia-success-200",
        warning: "bg-vigia-warning-50 text-vigia-warning-700 border border-vigia-warning-200",
        error: "bg-vigia-error-50 text-vigia-error-700 border border-vigia-error-200",
      },
      size: {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

interface CodeTextProps extends React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof codeVariants> {}

export function CodeText({
  variant,
  size,
  className,
  children,
  ...props
}: CodeTextProps) {
  return (
    <code
      className={cn(codeVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </code>
  )
}

// ============================================================================
// BLOCKQUOTE COMPONENT
// ============================================================================

interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  cite?: string
  author?: string
}

export function Blockquote({
  cite,
  author,
  className,
  children,
  ...props
}: BlockquoteProps) {
  return (
    <blockquote
      className={cn(
        "border-l-4 border-vigia-gold-500 pl-6 py-2 italic text-[#D8DEEB] bg-[#0B0E14] rounded-r",
        className
      )}
      cite={cite}
      {...props}
    >
      {children}
      {author && (
        <footer className="mt-2 text-sm text-[#D8DEEB] not-italic">
          — {author}
        </footer>
      )}
    </blockquote>
  )
}

// ============================================================================
// LIST COMPONENT
// ============================================================================

interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  ordered?: boolean
  variant?: "default" | "checkmarks" | "bullets" | "numbers"
}

export function List({
  ordered = false,
  variant = "default",
  className,
  children,
  ...props
}: ListProps) {
  const Component = ordered ? "ol" : "ul"

  const variantClasses = {
    default: ordered ? "list-decimal" : "list-disc",
    checkmarks: "",
    bullets: "list-disc",
    numbers: "list-decimal",
  }

  return (
    <Component
      className={cn(
        "space-y-2 pl-6 text-[#D8DEEB]",
        variantClasses[variant],
        variant === "checkmarks" && "list-none pl-0",
        className
      )}
      {...props}
    >
      {variant === "checkmarks"
        ? React.Children.map(children, (child) => (
            <li className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-vigia-success-500 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {child}
            </li>
          ))
        : children}
    </Component>
  )
}

// ============================================================================
// TEXT VARIANTS (Utility Component)
// ============================================================================

const textVariants = cva("", {
  variants: {
    variant: {
      default: "text-[#D8DEEB]",
      muted: "text-[#7A8299]",
      primary: "text-vigia-teal-500",
      gold: "text-vigia-gold-500",
      success: "text-vigia-success-500",
      warning: "text-vigia-warning-500",
      error: "text-vigia-error-500",
      white: "text-white",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "base",
    weight: "normal",
    align: "left",
  },
})

interface TextProps extends React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof textVariants> {
  as?: "span" | "p" | "div"
}

export function Text({
  variant,
  size,
  weight,
  align,
  as: Component = "span",
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(textVariants({ variant, size, weight, align }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}
