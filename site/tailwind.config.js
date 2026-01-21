/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,njk,md}"],
  theme: {
    extend: {
      colors: {
        // MASCP brand colors (from the site)
        'mascp-red': '#8B2332',
        'mascp-terracotta': '#C4533A',
        'mascp-dark': '#252F35',
        'mascp-gray': '#5A5A5A',
        'mascp-light': '#F5F5F5',
      },
      fontFamily: {
        'heading': ['"Brandon Grot W01 Light"', 'system-ui', '-apple-system', 'sans-serif'],
        'body': ['"Brandon Grot W01 Light"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
