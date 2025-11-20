import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'ibm-plex-sans-arabic': ['IBM Plex Sans Arabic', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        'inter': ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        'arabic': ['IBM Plex Sans Arabic', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        'english': ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      fontSize: {
        // Arabic-optimized font sizes
        'arabic-xs': ['0.75rem', { lineHeight: '1.7', letterSpacing: '0.015em' }],
        'arabic-sm': ['0.875rem', { lineHeight: '1.7', letterSpacing: '0.015em' }],
        'arabic-base': ['1rem', { lineHeight: '1.8', letterSpacing: '0.01em' }],
        'arabic-lg': ['1.125rem', { lineHeight: '1.75', letterSpacing: '0.01em' }],
        'arabic-xl': ['1.25rem', { lineHeight: '1.7', letterSpacing: '0.005em' }],
        'arabic-2xl': ['1.5rem', { lineHeight: '1.7', letterSpacing: '0.005em' }],
        'arabic-3xl': ['1.875rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'arabic-4xl': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'arabic-5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'arabic-6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'arabic-7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'arabic-8xl': ['6rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'arabic-9xl': ['8rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        
        // English-optimized font sizes
        'english-xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'english-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'english-base': ['1rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'english-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'english-xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'english-2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'english-3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '0.01em' }],
        'english-4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '0.01em' }],
        'english-5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '0.01em' }],
        'english-6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '0.01em' }],
        'english-7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '0.01em' }],
        'english-8xl': ['6rem', { lineHeight: '1.1', letterSpacing: '0.01em' }],
        'english-9xl': ['8rem', { lineHeight: '1.1', letterSpacing: '0.01em' }],
      },
      lineHeight: {
        // Arabic-optimized line heights
        'arabic-tight': '1.1',
        'arabic-snug': '1.3',
        'arabic-normal': '1.6',
        'arabic-relaxed': '1.8',
        'arabic-loose': '2.0',
        
        // English-optimized line heights
        'english-tight': '1.1',
        'english-snug': '1.3',
        'english-normal': '1.5',
        'english-relaxed': '1.6',
        'english-loose': '1.8',
      },
      letterSpacing: {
        // Arabic-optimized letter spacing
        'arabic-tighter': '-0.03em',
        'arabic-tight': '-0.02em',
        'arabic-normal': '0.01em',
        'arabic-wide': '0.02em',
        'arabic-wider': '0.05em',
        
        // English-optimized letter spacing
        'english-tighter': '-0.02em',
        'english-tight': '-0.01em',
        'english-normal': '0.01em',
        'english-wide': '0.02em',
        'english-wider': '0.05em',
      },
      wordSpacing: {
        // Arabic-optimized word spacing
        'arabic-tight': '0.08em',
        'arabic-normal': '0.15em',
        'arabic-wide': '0.2em',
        'arabic-wider': '0.25em',
        
        // English-optimized word spacing
        'english-tight': '0.05em',
        'english-normal': '0.1em',
        'english-wide': '0.15em',
      },
      borderRadius: {
        // ROBWAH DEVELOPER - Updated Border Radius to 30px
        'none': '0',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '30px',
        '2xl': '36px',
        '3xl': '42px',
        'full': '9999px',
        // Default border radius is now 30px
        'DEFAULT': '30px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
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
        input: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
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
        'arabic-fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'arabic-slide-in': {
          '0%': {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'arabic-fade-in': 'arabic-fade-in 0.6s ease-out',
        'arabic-slide-in': 'arabic-slide-in 0.8s ease-out',
      },
      spacing: {
        // Arabic-optimized spacing
        'arabic-xs': '0.5rem',
        'arabic-sm': '0.75rem',
        'arabic-md': '1rem',
        'arabic-lg': '1.5rem',
        'arabic-xl': '2rem',
        'arabic-2xl': '3rem',
        'arabic-3xl': '4rem',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // Custom plugin for Arabic text optimization
    function({ addUtilities, theme }: any) {
      const arabicUtilities = {
        '.text-arabic': {
          fontFamily: theme('fontFamily.arabic'),
          lineHeight: theme('lineHeight.arabic-relaxed'),
          wordSpacing: theme('wordSpacing.arabic-normal'),
          letterSpacing: theme('letterSpacing.arabic-normal'),
        },
        '.text-english': {
          fontFamily: theme('fontFamily.english'),
          lineHeight: theme('lineHeight.english-relaxed'),
          letterSpacing: theme('letterSpacing.english-normal'),
        },
        '.rtl-optimized': {
          direction: 'rtl',
          textAlign: 'right',
          fontFamily: theme('fontFamily.arabic'),
        },
        '.ltr-optimized': {
          direction: 'ltr',
          textAlign: 'left',
          fontFamily: theme('fontFamily.english'),
        },
      };
      addUtilities(arabicUtilities);
    },
  ],
};
export default config;
