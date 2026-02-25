/**
 * VigIA Design Tokens
 *
 * Centralized design constants for consistent styling across the application.
 * Import and use these tokens instead of hardcoding values.
 *
 * @example
 * import { COLORS, TYPOGRAPHY, SPACING } from '@/lib/design-tokens'
 *
 * <div style={{ color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.lg }}>
 */

// ============================================================================
// COLORS
// ============================================================================

export const COLORS = {
  // Primary - VigIA Blue
  primary: '#0A2647',
  primaryHover: '#081E39',
  primaryActive: '#06162B',
  primaryLight: '#B3C5DB',
  primaryLighter: '#E6EBF2',

  // Accent - VigIA Gold
  accent: '#D4AF37',
  accentHover: '#B89630',
  accentActive: '#8B7124',
  accentLight: '#F5ECCC',
  accentLighter: '#FBF8EF',

  // Research - VigIA Purple
  research: '#7C3AED',
  researchHover: '#6930CA',
  researchActive: '#5626A7',
  researchLight: '#DCC9F3',
  researchLighter: '#F3EEFB',

  // Semantic Colors
  success: '#10B981',
  successHover: '#059669',
  successLight: '#ECFDF5',

  warning: '#F59E0B',
  warningHover: '#D97706',
  warningLight: '#FFFBEB',

  error: '#EF4444',
  errorHover: '#DC2626',
  errorLight: '#FEF2F2',

  info: '#3B82F6',
  infoHover: '#2563EB',
  infoLight: '#EFF6FF',

  // Neutral Grays
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Whites and Blacks
  white: '#FFFFFF',
  black: '#000000',
} as const

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: 'JetBrains Mono, "Courier New", monospace',
    brand: 'Georgia, "Times New Roman", serif',
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    md: '1.125rem',     // 18px
    lg: '1.25rem',      // 20px
    xl: '1.5rem',       // 24px
    '2xl': '1.875rem',  // 30px
    '3xl': '2.25rem',   // 36px
    '4xl': '3rem',      // 48px
    '5xl': '3.5rem',    // 56px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const

// ============================================================================
// SPACING
// ============================================================================

export const SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const RADIUS = {
  none: '0px',
  sm: '0.25rem',    // 4px
  base: '0.5rem',   // 8px
  md: '0.625rem',   // 10px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
} as const

// ============================================================================
// SHADOWS
// ============================================================================

export const SHADOWS = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Colored shadows
  goldGlow: '0 0 30px rgba(212, 175, 55, 0.5)',
  blueGlow: '0 0 30px rgba(10, 38, 71, 0.3)',
  purpleGlow: '0 0 30px rgba(124, 58, 237, 0.4)',
} as const

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ============================================================================
// Z-INDEX
// ============================================================================

export const ZINDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const

// ============================================================================
// ANIMATION
// ============================================================================

export const ANIMATION = {
  duration: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  },
} as const

// ============================================================================
// GRADIENTS
// ============================================================================

export const GRADIENTS = {
  blue: 'linear-gradient(135deg, #0A2647 0%, #020817 100%)',
  gold: 'linear-gradient(135deg, #D4AF37 0%, #E8C547 100%)',
  purple: 'linear-gradient(135deg, #7C3AED 0%, #9760DB 100%)',
  blueToGold: 'linear-gradient(135deg, #0A2647 0%, #D4AF37 100%)',
  animated: 'linear-gradient(270deg, #0A2647, #2C74B3, #D4AF37)',
} as const

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const COMPONENT = {
  button: {
    height: {
      sm: '32px',
      md: '36px',
      lg: '40px',
    },
    padding: {
      sm: '8px 12px',
      md: '8px 16px',
      lg: '10px 24px',
    },
  },

  input: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
    padding: {
      sm: '8px 12px',
      md: '10px 14px',
      lg: '12px 16px',
    },
  },

  card: {
    padding: {
      sm: '16px',
      md: '24px',
      lg: '32px',
    },
    gap: {
      sm: '12px',
      md: '16px',
      lg: '24px',
    },
  },

  badge: {
    padding: {
      sm: '2px 8px',
      md: '4px 12px',
      lg: '6px 16px',
    },
  },
} as const

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const A11Y = {
  // WCAG contrast ratios
  contrastRatio: {
    AA: 4.5,
    AAA: 7,
    AALarge: 3,
    AAALarge: 4.5,
  },

  // Minimum touch target size
  touchTarget: {
    min: '44px',
    recommended: '48px',
  },

  // Focus ring
  focusRing: {
    width: '2px',
    offset: '2px',
    color: COLORS.primary,
  },
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color with opacity
 * @param color - Hex color code
 * @param opacity - Opacity value (0-1)
 */
export function withOpacity(color: string, opacity: number): string {
  // Convert hex to RGB and add opacity
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Get spacing value by number
 * @param multiplier - Spacing multiplier (1-32)
 */
export function spacing(multiplier: keyof typeof SPACING): string {
  return SPACING[multiplier]
}

/**
 * Get responsive breakpoint media query
 * @param breakpoint - Breakpoint key
 */
export function mediaQuery(breakpoint: keyof typeof BREAKPOINTS): string {
  return `@media (min-width: ${BREAKPOINTS[breakpoint]})`
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ColorToken = keyof typeof COLORS
export type SpacingToken = keyof typeof SPACING
export type BreakpointToken = keyof typeof BREAKPOINTS
export type FontSizeToken = keyof typeof TYPOGRAPHY.fontSize
export type FontWeightToken = keyof typeof TYPOGRAPHY.fontWeight
