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
        background: "var(--background) / <alpha-value>)",
        foreground: "var(--foreground) / <alpha-value>)",

        navbarBg: "var(--navbar-bg) / <alpha-value>)",
        navbarItemsBg: "var(--main-text-bg) / <alpha-value>)",
        navbarIcons: "var(--navbar-icons) / <alpha-value>)",

        primaryLight: "var(--primary-light) / <alpha-value>)",
        primary: "var(--primary) / <alpha-value>)",
        primaryDark: "var(--primary-dark) / <alpha-value>)",
        accent: "var(--accent) / <alpha-value>)",
        accentDark: "var(--accent-dark) / <alpha-value>)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
