import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // VigIA Brand Colors
        vigia: {
          // Core Dark Scale
          midnight: '#0B0E14',   // Background principal
          deep: '#111520',       // Cards, elementos elevados
          surface: '#161B27',    // Superfícies secundárias
          border: '#1E2535',     // Bordas
          muted: '#2A3147',      // Elementos inativos
          navy: '#1A2544',       // Fundo alternativo
          // Accent Teal Scale
          teal: {
            DEFAULT: '#0D7377', // Acento principal
            50: '#E6F5F5',
            100: '#B3E0E0',
            200: '#80CCCC',
            300: '#4DB8B8',
            400: '#1AA3A3',
            500: '#0D7377',
            600: '#0A5C5F',
            700: '#084547',
            800: '#052E30',
            900: '#031718',
            light: '#14BDAE',  // Acento ativo, links, IA
          },
          // Accent Gold Scale
          gold: {
            DEFAULT: '#C9A84C', // Acento secundário
            50: '#FBF8EF',
            100: '#F5ECCC',
            200: '#EFE0A9',
            300: '#E8C97A',     // gold-light - taglines, itálicos
            400: '#D9B85E',
            500: '#C9A84C',
            600: '#B89630',
            700: '#8B7124',
            800: '#5E4C18',
            900: '#31260C',
            light: '#E8C97A',  // Taglines, itálicos
          },
          // Text Colors
          cream: '#F0EAD6',    // Texto principal (sobre escuro)
          text: '#D8DEEB',     // Texto corpo
          'text-dim': '#7A8299', // Texto secundário
          // Semantic Colors
          danger: '#C0392B',   // Alertas, erros
          success: '#1A8C6A',  // Status ok
        },
        // Backwards-compatible aliases (telos → vigia mapping)
        telos: {
          blue: {
            50: '#E6F5F5',
            100: '#B3E0E0',
            200: '#80CCCC',
            300: '#4DB8B8',
            400: '#1AA3A3',
            500: '#0D7377',
            600: '#0A5C5F',
            700: '#084547',
            800: '#052E30',
            900: '#031718',
          },
          gold: {
            50: '#FBF8EF',
            100: '#F5ECCC',
            200: '#EFE0A9',
            300: '#E8C97A',
            400: '#D9B85E',
            500: '#C9A84C',
            600: '#B89630',
            700: '#8B7124',
            800: '#5E4C18',
            900: '#31260C',
          },
          purple: {
            50: '#E6F5F5',
            100: '#B3E0E0',
            200: '#80CCCC',
            300: '#4DB8B8',
            400: '#1AA3A3',
            500: '#0D7377',
            600: '#0A5C5F',
            700: '#084547',
            800: '#052E30',
            900: '#031718',
          },
          success: {
            50: '#ECFDF5',
            500: '#1A8C6A',
            600: '#158A63',
            700: '#10785A',
          },
          warning: {
            50: '#FFFBEB',
            500: '#C9A84C',
            600: '#B89630',
            700: '#8B7124',
          },
          error: {
            50: '#FEF2F2',
            500: '#C0392B',
            600: '#A93226',
            700: '#922B21',
          },
          info: {
            50: '#E6F5F5',
            500: '#14BDAE',
            600: '#0D7377',
            700: '#0A5C5F',
          },
        },

        // Base theme colors (for compatibility)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Syne', 'var(--font-syne)', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'var(--font-dm-mono)', 'monospace'],
        brand: ['Cormorant Garamond', 'var(--font-cormorant)', 'Georgia', 'serif'],
        display: ['Cormorant Garamond', 'var(--font-cormorant)', 'Georgia', 'serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],        // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
        base: ['1rem', { lineHeight: '1.5rem' }],       // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
      },
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '100': '25rem',   // 400px
        '112': '28rem',   // 448px
        '128': '32rem',   // 512px
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'gold-glow': '0 0 30px rgba(201, 168, 76, 0.5)',
        'teal-glow': '0 0 30px rgba(13, 115, 119, 0.4)',
        'blue-glow': '0 0 30px rgba(13, 115, 119, 0.3)',
        'purple-glow': '0 0 30px rgba(13, 115, 119, 0.4)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 20px -5px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      backgroundImage: {
        'tech-grid': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230A2647' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        // Fade animations
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-down': {
          from: {
            opacity: '0',
            transform: 'translateY(-30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-left': {
          from: {
            opacity: '0',
            transform: 'translateX(-30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'fade-in-right': {
          from: {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        // Scale animations
        'scale-in': {
          from: {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        // Movement animations
        'bounce-slow': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        'pulse-slow': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '0.8',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        // Glow animation
        'glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(212, 175, 55, 0.2), 0 0 10px rgba(212, 175, 55, 0.1)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.6), 0 0 30px rgba(212, 175, 55, 0.4)',
          },
        },
        // Shimmer animation
        'shimmer': {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },
        // Gradient animation
        'gradient-shift': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
        // Tech Reveal
        'tech-reveal': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95) translateY(10px)',
            filter: 'blur(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
            filter: 'blur(0)',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'fade-in-down': 'fade-in-down 0.8s ease-out',
        'fade-in-left': 'fade-in-left 0.8s ease-out',
        'fade-in-right': 'fade-in-right 0.8s ease-out',
        'scale-in': 'scale-in 0.5s ease-out',
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'tech-reveal': 'tech-reveal 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
