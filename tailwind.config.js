/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{ts,tsx}",
      "./components/**/*.{ts,tsx}",
      "./pages/**/*.{ts,tsx}",
      "./lib/**/*.{ts,tsx}",
      "./contexts/**/*.{ts,tsx}",
    ],
    theme: {
      extend: {
        borderRadius: {
          sm: "var(--radius-sm)",
          md: "var(--radius-md)",
          lg: "var(--radius-lg)",
          xl: "var(--radius-xl)",
        },
        colors: {
          background: "var(--color-background)",
          foreground: "var(--color-foreground)",
        },
        fontFamily: {
          sans: "var(--font-sans)",
          mono: "var(--font-mono)",
        },
      },
    },
    plugins: [
      require("tailwindcss-animate"),
    ],
  };
  