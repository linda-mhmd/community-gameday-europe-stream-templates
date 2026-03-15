import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Allow importing compositions from the parent project
      "@compositions": path.resolve(__dirname, ".."),
      // CRITICAL: Deduplicate React — both the player and compositions
      // must use the exact same React instance, otherwise Remotion hooks fail.
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      remotion: path.resolve(__dirname, "node_modules/remotion"),
    },
  },
  // Serve the parent public/ folder for static assets (logos, faces, etc.)
  publicDir: path.resolve(__dirname, "..", "public"),
});
