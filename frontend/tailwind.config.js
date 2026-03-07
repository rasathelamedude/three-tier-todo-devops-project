/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        ink: "#0D0D0D",
        paper: "#F5F0E8",
        accent: "#E8490F",
        muted: "#9C9586",
        border: "#D9D3C7",
        done: "#2D6A4F",
      },
      animation: {
        "slide-in": "slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-up": "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        strike: "strike 0.3s ease forwards",
      },
      keyframes: {
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
