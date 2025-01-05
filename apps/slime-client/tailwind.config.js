/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js,tsx,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        dark: "#242424",
        light: "#dcdcdc"
      }
    },
  },
  plugins: [],
}

