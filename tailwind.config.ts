import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-urbanist)", "system-ui", "sans-serif"],
        heading: ["var(--font-oswald)", "system-ui", "sans-serif"],
      },
      colors: {
        feg: {
          white: "#ffffff",
          "bg-light": "#fafafa",
          "bg-muted": "#f2f2f2",
          black: "#000000",
          dark: "#272727",
          "dark-alt": "#212529",
          gray: "#5f5f5f",
          accent: "#c6ef2e",
          "accent-light": "#eaff9d",
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
