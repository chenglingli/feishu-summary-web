import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // Allow only this trial tunnel; keep Host checks enabled for every other domain.
    allowedHosts: ["animal-circus-garden.ngrok-free.dev"],
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/auth": "http://127.0.0.1:8000",
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts*"],
    setupFiles: ["src/test-setup.ts"],
  },
});
