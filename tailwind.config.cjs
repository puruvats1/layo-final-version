/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  important: 'html',
  // Tailwind 3 hover: variants latch after a tap on touch screens; only apply them where hover exists
  future: { hoverOnlyWhenSupported: true },
  safelist: [
    {
      pattern:
        /(bg|border|text|stroke|fill)-(foreground|card|popover|muted|destructive|border|input|ring|white|primary|secondary|background|accent)(\/\d+)?$/,
    },
    {
      pattern: /(bg|border|text|stroke|fill)-(card|popover|muted|primary|secondary|accent)-(foreground)(\/\d+)?$/,
    },
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (values live in src/global.css)
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        card: { DEFAULT: 'rgb(var(--card) / <alpha-value>)', foreground: 'rgb(var(--card-foreground) / <alpha-value>)' },
        popover: { DEFAULT: 'rgb(var(--popover) / <alpha-value>)', foreground: 'rgb(var(--popover-foreground) / <alpha-value>)' },
        muted: { DEFAULT: 'rgb(var(--muted) / <alpha-value>)', foreground: 'rgb(var(--muted-foreground) / <alpha-value>)' },
        primary: { DEFAULT: 'rgb(var(--primary) / <alpha-value>)', foreground: 'rgb(var(--primary-foreground) / <alpha-value>)' },
        secondary: { DEFAULT: 'rgb(var(--secondary) / <alpha-value>)', foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)' },
        accent: { DEFAULT: 'rgb(var(--accent) / <alpha-value>)', foreground: 'rgb(var(--accent-foreground) / <alpha-value>)' },
        destructive: { DEFAULT: 'rgb(var(--destructive) / <alpha-value>)' },
        glass: 'rgb(var(--glass) / <alpha-value>)',
        kith: 'rgb(var(--k-accent) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        onglow: 'rgb(var(--on-glow) / <alpha-value>)',
        white: 'rgb(255 255 255)',
      },
      // Nested radii (see global.css): sheet > card > field, each = its parent's radius - the parent's padding.
      // Pills are `rounded-full`. Use p-pad-sheet inside a sheet and p-pad-card inside a card so the maths holds.
      borderRadius: {
        field: 'var(--r-field)', // inputs, tiles and images inside a card
        card: 'var(--r-card)', // cards inside a sheet, or on the page
        sheet: 'var(--r-sheet)', // bottom sheets, dialogs, floating panels
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      // Kith type scale (better-typography). rem against a 93.75% root (15px at the default browser size,
      // and it follows the reader's setting). Unitless line-heights; tracking in em, per size.
      // Floor is 12px: the old 2xs (10px) and xs (11.25px) were too small for grey text on glass.
      fontSize: {
        '2xs': ['0.8rem', { lineHeight: '1.35', letterSpacing: '0.005em' }], // 12px  meta, captions
        xs: ['0.8667rem', { lineHeight: '1.4', letterSpacing: '0' }], // 13px  hints, chips, toasts
        sm: ['0.9333rem', { lineHeight: '1.45', letterSpacing: '-0.004em' }], // 14px  labels, secondary body
        base: ['1rem', { lineHeight: '1.5', letterSpacing: '-0.011em' }], // 15px  body
        lg: ['1.1333rem', { lineHeight: '1.4', letterSpacing: '-0.012em' }], // 17px  emphasis
        xl: ['1.2667rem', { lineHeight: '1.3', letterSpacing: '-0.014em' }], // 19px  card titles
        '2xl': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.018em' }], // 22.5px
        '3xl': ['1.875rem', { lineHeight: '1.15', letterSpacing: '-0.022em' }], // 28px  screen titles
        '4xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }], // 34px
        '5xl': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.028em' }],
        '6xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      },
      // Kith layout rhythm (402px phone reference)
      spacing: {
        'pad-sheet': 'var(--pad-sheet)',
        'pad-card': 'var(--pad-card)',
        edge: 'var(--k-edge)',
        ctl: 'var(--k-ctl)',
        dock: 'var(--k-dock)',
        gap: 'var(--k-gap)',
        row: 'var(--k-row)',
        top: 'var(--k-top)',
        bottom: 'var(--k-bottom)',
      },
      boxShadow: {
        'hard-1': '-2px 2px 8px 0px rgba(38, 38, 38, 0.20)',
        'hard-2': '0px 3px 10px 0px rgba(38, 38, 38, 0.20)',
        'hard-5': '0px 2px 10px 0px rgba(38, 38, 38, 0.10)',
        'soft-1': '0px 0px 10px rgba(38, 38, 38, 0.1)',
        'soft-2': '0px 0px 20px rgba(38, 38, 38, 0.2)',
        xs: '0 1px 2px rgb(23 24 40 / 0.04)',
        // beautiful-shadows: neutral layered elevation for paper surfaces (Home, onboarding). Exact values.
        'k-sm': '0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)',
        'k-md': '0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 1px -0.5px rgba(0,0,0,0.06), 0px 3px 3px -1.5px rgba(0,0,0,0.06), 0px 6px 6px -3px rgba(0,0,0,0.06), 0px 12px 12px -6px rgba(0,0,0,0.06), 0px 24px 24px -12px rgba(0,0,0,0.06)',
        'k-lg': '0 2.8px 2.2px rgba(0,0,0,0.034), 0 6.7px 5.3px rgba(0,0,0,0.048), 0 12.5px 10px rgba(0,0,0,0.06), 0 22.3px 17.9px rgba(0,0,0,0.072), 0 41.8px 33.4px rgba(0,0,0,0.086), 0 100px 80px rgba(0,0,0,0.12)',
      },
    },
  },
};
