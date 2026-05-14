/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split the chart library out so the main bundle stays small.
          recharts: ["recharts"],
          // React + router + react-query into their own vendor chunk.
          "react-vendor": ["react", "react-dom", "react-router-dom", "@tanstack/react-query"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
