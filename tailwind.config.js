/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexusWhite: '#ffffff',
        nexusAccent: '#6366F1',
        nexusBorder: '#1E293B',
        nexusLightGray: '#94A3B8',
        nexusDarkGray: '#0F172A',
      }
    },
  },
  plugins: [],
}
