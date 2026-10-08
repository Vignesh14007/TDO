/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tdo: {
          bg: "#FFFFFF",
          surface: "#F7F7F7",
          border: "#E5E5E5",
          secondary: "#666666",
          primary: "#111111",
          dark: {
            bg: "#0A0A0A",
            surface: "#141414",
            card: "#191919",
            border: "#262626",
            secondary: "#A1A1A1",
            primary: "#EDEDED",
          },
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
}
