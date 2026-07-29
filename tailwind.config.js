/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/main.js", "./scripts/build-insights.mjs"],
  theme: {
    extend: {
      colors: {
        bg:        '#FCFAF6',  // Background
        surface:   '#F3EEE5',  // Surface
        surface2:  '#E7DFD2',  // Secondary Surface
        text:      '#000000',  // Text
        subtext:   '#000000',  // Secondary Text
        dark:      '#32493E',  // Primary Brand — Jungle Green
        accent:    '#86915A',  // Primary Accent — Olive
        highlight: '#86915A',  // Secondary Accent — ahora también Olive
        success:   '#6E8B6B',
        warning:   '#C48A3A',
        error:     '#A6574B',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
