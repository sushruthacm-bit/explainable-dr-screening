/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F3ECE0',
          300: '#EAE1CE',
        },
        cream: {
          DEFAULT: '#F5EFEB',
          dark: '#EFE7DE',
          light: '#FBF9F6',
        },
        sand: {
          light: '#E8DED1',
          DEFAULT: '#D4C3AA',
          dark: '#BBA588',
        },
        sage: {
          50: '#F2F6F3',
          100: '#E2EBE4',
          200: '#C5D7C9',
          300: '#A4C0AA',
          400: '#7E9A82',
          DEFAULT: '#65826A',
          600: '#4E6753',
          700: '#3D5141',
        },
        olive: {
          light: '#A3B47F',
          DEFAULT: '#8A9A65',
          dark: '#6E7F46',
        },
        earth: {
          50: '#F8F6F4',
          100: '#EFECE7',
          200: '#D9D3CA',
          300: '#BDB3A6',
          400: '#948877',
          DEFAULT: '#6D5D4B',
          600: '#544738',
          700: '#3D3328',
        },
        terracotta: {
          light: '#EAA484',
          DEFAULT: '#D9825B',
          dark: '#C86D44',
          deep: '#A7522C',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'pop': 'pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'scan': 'scanLine 2s linear infinite',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.92', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scanLine: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        }
      }
    },
  },
  plugins: [],
}
