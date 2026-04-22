/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        text: '#F8FAFC',
        muted: '#94A3B8',
        border: '#334155'
      }
    },
  },
  plugins: [],
}
