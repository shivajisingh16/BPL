/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Esports palette
        ink: {
          900: '#05060a', // near-black background
          800: '#0a0c14',
          700: '#11131f',
          600: '#181b29',
          500: '#22263a',
        },
        neon: {
          purple: '#a855f7',
          violet: '#7c3aed',
          cyan: '#22d3ee',
          gold: '#fbbf24',
        },
      },
      fontFamily: {
        display: ['"Orbitron"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Rajdhani"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.35)',
        'neon-cyan': '0 0 20px rgba(34, 211, 238, 0.35)',
        'neon-gold': '0 0 22px rgba(251, 191, 36, 0.4)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'grid-glow':
          'radial-gradient(circle at 20% 10%, rgba(124,58,237,0.18), transparent 40%), radial-gradient(circle at 85% 20%, rgba(34,211,238,0.14), transparent 42%), radial-gradient(circle at 50% 95%, rgba(251,191,36,0.10), transparent 45%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.6s ease-out both',
        float: 'float 5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
