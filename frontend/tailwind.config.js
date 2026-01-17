/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'wa-bg-main': '#efeae2',
        'wa-bg-sidebar': '#ffffff',
        'wa-header': '#f0f2f5',
        'wa-green': '#00a884',
        'wa-green-dark': '#008069',
        'wa-message-out': '#d9fdd3',
        'wa-message-in': '#ffffff',
        'wa-text-main': '#111b21',
        'wa-text-secondary': '#667781',
      },
    },
  },
  plugins: [],
}
