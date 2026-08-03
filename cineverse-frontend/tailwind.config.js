/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cinematic Noir palette
        accent: {
          DEFAULT: "#BE1A1A",
          alt: "#D0311E",
          glow: "#E23B2A",
        },
        gold: {
          DEFAULT: "#F7D87F",
          soft: "#F8EBAB",
        },
        noir: {
          950: "#0A0C0E",
          900: "#111417",
          850: "#15191D",
          800: "#1A1F24",
          700: "#23292F",
          600: "#2E353C",
        },
      },
      fontFamily: {
        // Display / cinematic headlines
        display: ['"Tanker"', '"Anybody"', "system-ui", "sans-serif"],
        // UI / body — premium sans
        sans: ['"Anybody"', "Satoshi", "system-ui", "-apple-system", "sans-serif"],
      },
      letterSpacing: {
        cinema: "0.18em",
        wider2: "0.28em",
      },
      backgroundImage: {
        "noir-radial":
          "radial-gradient(120% 120% at 50% 0%, #1A1F24 0%, #111417 45%, #0A0C0E 100%)",
        "accent-glow":
          "radial-gradient(60% 60% at 50% 50%, rgba(190,26,26,0.35) 0%, rgba(190,26,26,0) 70%)",
        "gold-line":
          "linear-gradient(90deg, rgba(247,216,127,0) 0%, rgba(247,216,127,0.8) 50%, rgba(247,216,127,0) 100%)",
      },
      boxShadow: {
        glass: "0 8px 40px -8px rgba(0,0,0,0.6)",
        float: "0 18px 60px -12px rgba(0,0,0,0.75)",
        "accent-glow": "0 0 40px -6px rgba(190,26,26,0.6)",
        "gold-glow": "0 0 28px -4px rgba(247,216,127,0.45)",
        card: "0 20px 50px -20px rgba(0,0,0,0.85)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slow-zoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.12)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%,100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both",
        "slow-zoom": "slow-zoom 18s ease-out forwards",
        shimmer: "shimmer 1.8s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
