import { defineConfig } from "vite";

// Minimal Vite config without @vitejs/plugin-react.
// Note: you won't have React fast refresh or plugin-specific optimizations.
export default defineConfig({
  server: {
    port: 5173
  }
});