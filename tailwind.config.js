/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Nunito"', '"Comic Neue"', "system-ui", "sans-serif"],
        body: ['"Nunito"', "system-ui", "sans-serif"],
      },
      colors: {
        cream: "#FFF8EC",
        mint: {
          100: "#E6F7F1",
          300: "#9DE3C9",
          500: "#3CC79A",
          700: "#1F8E6B",
        },
        sun: {
          100: "#FFF1C2",
          300: "#FFD96A",
          500: "#FFB42E",
        },
        sky: {
          100: "#E0F1FF",
          300: "#7CC4FF",
          500: "#2E8FE6",
        },
        berry: {
          300: "#FFB1C8",
          500: "#FF6F9C",
        },
        ink: {
          800: "#243144",
          500: "#52607A",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        kid: "0 8px 0 rgba(36,49,68,0.08)",
      },
    },
  },
  plugins: [],
};
