import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds — light Korean bridal palette
        'wedding-cream':    '#FAF8F5', // main background
        'wedding-linen':    '#F5F3F0', // alternate section background
        'wedding-stone':    '#E8E4DF', // borders, subtle dividers
        // Text
        'wedding-charcoal': '#2C2C2C', // primary text (dark but not black)
        'wedding-mist':     '#8B8682', // secondary / muted text
        // Accent — warm gold (unchanged)
        'wedding-gold':       '#C9A96E',
        'wedding-gold-light': '#E5C890',
        'wedding-gold-dark':  '#A0793A',
      },
      fontFamily: {
        script:      ['Great Vibes', 'cursive'],
        display:     ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        body:        ['system-ui', '-apple-system', 'sans-serif'],
        'wedding-zh': ['Iansui', 'Noto Serif TC', 'serif'],
      },
      screens: {
        sm: '375px',
        md: '768px',
        lg: '1280px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'soft': '0 4px 24px rgba(139, 134, 130, 0.12)',
        'card': '0 2px 12px rgba(139, 134, 130, 0.10)',
      },
    },
  },
  plugins: [],
} satisfies Config
