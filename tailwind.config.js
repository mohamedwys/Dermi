/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    "bg-white/5", 
    "text-gray-300", 
    "bg-purple-500/20", 
    "bg-orange-500/20"
  ]
};
