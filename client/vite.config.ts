import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import os from "node:os";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  // This project lives inside a Dropbox-synced folder; Dropbox locks files
  // mid-write inside node_modules/.vite, causing intermittent EBUSY errors
  // during dependency pre-bundling. Keep the cache outside the synced tree.
  cacheDir: path.join(os.tmpdir(), "setu-vite-cache", "client"),
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
