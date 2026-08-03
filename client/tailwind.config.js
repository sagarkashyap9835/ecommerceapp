/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#EC4899",
        secondary: "#2563EB",
        surface: "#FDF2F8",
        accent: "#DB2777",
        brandCyan: "#0284C7",
        border: "#FBCFE8",
        error: "#EF4444",
      }
    },
  },
  plugins: [],
}