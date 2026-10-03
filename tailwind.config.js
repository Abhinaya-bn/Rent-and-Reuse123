/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        chocolate: {
          50: '#FDF5F2',
          100: '#F9E6E0',
          200: '#F0CDBF',
          300: '#E5A590',
          400: '#C96E55',
          500: '#A04534',
          600: '#7A2F22',
          700: '#5A2018',
          800: '#3E000C',
          900: '#2D0009',
        },
        sand: {
          50: '#FFFDF8',
          100: '#FFF9EF',
          200: '#FFECD1',
          300: '#FFE0B5',
          400: '#FFD089',
          500: '#FCB85C',
          600: '#E89938',
          700: '#C97A20',
          800: '#A05E16',
          900: '#7A4810',
        },
        cream: '#FFFDF8',
        offwhite: '#FFECD1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.5s ease-out both',
        'slide-down': 'slideDown 0.35s ease-out both',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'page-enter': 'pageEnter 0.4s ease-out both',
        'stagger-in': 'staggerIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'intro-fade': 'introFade 0.6s ease-out both',
        'intro-logo': 'introLogo 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'intro-text': 'introText 0.6s ease-out 0.3s both',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pageEnter: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        staggerIn: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        introFade: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0', visibility: 'hidden' },
        },
        introLogo: {
          '0%': { opacity: '0', transform: 'scale(0.5) rotate(-10deg)' },
          '60%': { opacity: '1', transform: 'scale(1.08) rotate(2deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        introText: {
          '0%': { opacity: '0', transform: 'translateY(8px)', letterSpacing: '0.3em' },
          '100%': { opacity: '1', transform: 'translateY(0)', letterSpacing: '0.1em' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
