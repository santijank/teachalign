import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          primary: "#0F2D52",
          "primary-light": "#1A3D6E",
          secondary: "#1E4E8C",
          "secondary-light": "#2A62A8",
          success: "#2E7D32",
          "success-light": "#E8F5E9",
          warning: "#F9A825",
          "warning-light": "#FFF8E1",
          danger: "#C62828",
          "danger-light": "#FFEBEE",
          bg: "#F4F6F9",
          card: "#FFFFFF",
          border: "#DEE2E8",
          "text-primary": "#1A1A2E",
          "text-secondary": "#5A6474",
          "text-muted": "#8B95A5",
        },
      },
      fontFamily: {
        prompt: ["Prompt", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
