/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-nunito)"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primaryLight: "var(--primary-light)",
        primary: "var(--primary)",
        primaryDark: "var(--primary-dark)",
        accent: "var(--accent)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
