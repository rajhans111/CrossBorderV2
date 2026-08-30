/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0e7c86",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
      },
    },
  },
  plugins: [],
};
