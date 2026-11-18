/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FFF8F0',
          cream: '#FFF8F0',
          lines: '#EFE3D5',
          border: '#E8DCCB',
        },
        blush: {
          DEFAULT: '#FFD6E0',
          light: '#FFE8EE',
          dark: '#E8A3B5',
        },
        lavender: {
          DEFAULT: '#E4D9FF',
          light: '#F2ECFF',
          dark: '#BBA5F8',
        },
        mint: {
          DEFAULT: '#D4F5E4',
          light: '#EAFBF1',
          dark: '#166534',
          border: '#9FE2BF',
        },
        butter: {
          DEFAULT: '#FFF3B8',
          light: '#FFF9D9',
          dark: '#92400E',
          border: '#FFE47A',
        },
        babyblue: {
          DEFAULT: '#D6EBFF',
          light: '#EBF5FF',
          dark: '#1E40AF',
        },
        peach: {
          DEFAULT: '#FFE0CC',
          light: '#FFF0E6',
          dark: '#C25D1E',
        },
        coral: {
          DEFAULT: '#FFB5B5',
          light: '#FFE0E0',
          dark: '#991B1B',
          border: '#FF8A8A',
        },
        ink: {
          DEFAULT: '#4A4458',
          light: '#6B647B',
          dark: '#2E2A38',
          faint: '#8E879E',
        },
      },
      fontFamily: {
        handwritten: ['"Caveat"', '"Patrick Hand"', 'cursive'],
        body: ['"Nunito"', '"Quicksand"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        scrapbook: '0 4px 20px -2px rgba(74, 68, 88, 0.12), 0 2px 6px -1px rgba(74, 68, 88, 0.08)',
        polaroid: '0 8px 30px -4px rgba(74, 68, 88, 0.16), 0 4px 10px -2px rgba(74, 68, 88, 0.1)',
        pin: '0 2px 4px rgba(74, 68, 88, 0.25)',
      },
    },
  },
  plugins: [],
};
