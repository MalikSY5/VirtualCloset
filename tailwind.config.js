/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: "#ec4899",
          light: "#fdf2f8",
          medium: "#f472b6",
        },
        purple: {
          DEFAULT: "#8b5cf6",
          light: "#f5f3ff",
          medium: "#a78bfa",
        },
        navy: "#1e1b4b",
        muted: "#94a3b8",
      },
      fontFamily: {
        serif: ["PlayfairDisplay_400Regular", "Georgia", "serif"],
        "serif-bold": ["PlayfairDisplay_700Bold", "Georgia", "serif"],
        "serif-italic": ["PlayfairDisplay_400Regular_Italic", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
