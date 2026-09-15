/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Base sobria (aco/grafite) para um sistema operacional interno.
        base: {
          50: '#f5f7f8',
          100: '#e7ebee',
          200: '#cfd8de',
          300: '#a9bac4',
          400: '#7d94a3',
          500: '#5c7686',
          600: '#495e6d',
          700: '#3d4d59',
          800: '#35424c',
          900: '#1f292f',
        },
        // Acento funcional unico (verde-petroleo) reservado para acoes primarias.
        accent: {
          50: '#eafaf5',
          100: '#c9f0e2',
          500: '#0e9e73',
          600: '#0b7f5c',
          700: '#0a6a4d',
        },
        danger: {
          50: '#fdecec',
          100: '#fbd5d5',
          500: '#d83a3a',
          600: '#b62d2d',
          700: '#8f2222',
        },
        warn: {
          50: '#fff6e6',
          500: '#d98a00',
          600: '#b47100',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(31, 41, 47, 0.06), 0 1px 3px rgba(31, 41, 47, 0.04)',
      },
    },
  },
  plugins: [],
};
