/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "MTX-green": "#27bd98",
        "MTX-blue": "#005399",
      },
    },
  },
  plugins: [],
};
