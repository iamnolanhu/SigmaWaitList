import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  define: {
    // Replace environment variables in HTML at build time
    '%VITE_GA_MEASUREMENT_ID%': JSON.stringify(process.env.VITE_GA_MEASUREMENT_ID || ''),
  },
});
