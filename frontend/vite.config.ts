import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

      // Node polyfills
      buffer: "buffer",
      process: "process/browser",
      util: "util",
    },
  },

  define: {
    global: "globalThis",
  },

  optimizeDeps: {
    include: [
      "buffer",
      "process",
      "util",
      "algosdk",
      "@perawallet/connect",
    ],
  },
});
