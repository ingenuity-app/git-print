/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ingenuity: {
          black: '#000000',
          red: '#ED1C24',
          darker: '#1A1A1A',
          dark: '#262626',
          gray: '#404040',
          light: '#737373',
        },
        cream: '#F0EEE6',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.571', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'lg': ['1.125rem', { lineHeight: '1.556', letterSpacing: '0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '1.333', letterSpacing: '0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '1.267', letterSpacing: '0.01em' }],
        '4xl': ['2.25rem', { lineHeight: '1.222', letterSpacing: '0.01em' }],
        '5xl': ['3rem', { lineHeight: '1.167', letterSpacing: '0.01em' }],
        '6xl': ['3.75rem', { lineHeight: '1.133', letterSpacing: '0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
};
