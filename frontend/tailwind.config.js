/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // --- HAICA Brand Colors (from DESIGN.md) ---
      colors: {
        haica: {
          navy:  '#1B3A6B',
          red:   '#BA2227',
          blue:  '#428BCA',
          green: '#DDEEBB',
        },
        semantic: {
          success: '#16a34a',
          warning: '#d97706',
          error:   '#BA2227',
        },
        dark: {
          surface:    '#1E293B',
          'surface-alt':'#0F172A',
          border:       '#334155',
          text:         '#F8FAFC',
          muted:        '#94a3b8',
        },
      },
      animation: {
        spin: 'spin 0.8s linear infinite',
      },
      // --- Font ---
      fontFamily: {
        arabic: ['"Noto Kufi Arabic"', '"Droid Arabic Kufi"', 'Arial', 'sans-serif'],
      },
      // --- Custom Shadows (from DESIGN.md §6) ---
      boxShadow: {
        card:        '2px 2px 2px 0px rgba(0,0,0,0.04)',
        'card-hover':'2px 2px 4px 0px rgba(0,0,0,0.08)',
        nav:         '2px 2px 0px 0px rgba(0,0,0,0.04)',
        pressed:     'inset 0px 2px 4px rgba(0,0,0,0.2)',
      },
      // --- Fixed Heights ---
      height: {
        nav:          '65px',
        input:        '44.8px',
        'input-hero': '67.2px',
      },
      // --- Container & Card widths ---
      maxWidth: {
        content: '1440px',
        card:    '240px',
      },
      minHeight: {
        hero: '300px',
        card: '211px',
      },
    },
  },
  plugins: [],
}
