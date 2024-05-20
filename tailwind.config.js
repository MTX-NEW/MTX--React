/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        "custom-h1": "1.5rem",
      },
      fontWeight: {
        bold: "700",
      },
      colors: {
        "MTX-green": "#27bd98",
        "MTX-blue": "#005399",
        "MTX-lightblue": "#f3faff",
        "MTX-mediumblue": "#dbe9f5",
        "MTX-greytext": "#8E8E8E",
      },
    },
  },
  plugins: [],
};
