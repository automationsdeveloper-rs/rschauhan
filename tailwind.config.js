/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', md: '1.5rem' }, screens: { '2xl': '1240px' } },
    extend: {
      colors: {
        primary: { DEFAULT: '#5B4BFF', 50: '#F0EEFF', 100: '#E1DDFF', 200: '#C3BBFF', 400: '#8478FF', 500: '#5B4BFF', 600: '#4535E6', 700: '#3628B8' },
        secondary: { DEFAULT: '#22D3EE', 400: '#22D3EE', 600: '#0891B2' },
        accent: { DEFAULT: '#FF7A45', 600: '#E85F27' },
        success: '#16A34A',
        danger: '#EF4444',
        // semantic tokens (switch with theme via CSS variables)
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl2: '20px', xl3: '24px' },
      boxShadow: {
        soft: '0 1px 2px rgb(16 24 64 / .04), 0 8px 24px -8px rgb(16 24 64 / .10)',
        lift: '0 2px 4px rgb(16 24 64 / .05), 0 20px 40px -12px rgb(91 75 255 / .25)',
        glow: '0 8px 30px -6px rgb(91 75 255 / .55)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #5B4BFF 0%, #22D3EE 100%)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        blob: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(40px,-30px) scale(1.1)' }, '66%': { transform: 'translate(-30px,30px) scale(.95)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        blob: 'blob 18s ease-in-out infinite',
        marquee: 'marquee 35s linear infinite',
      },
    },
  },
  plugins: [],
}
