import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  
  test: {
    globals: true, // Allows using 'describe', 'it' without importing
    environment: "node", // Ensures Vitest doesn't try to use jsdom
  },
});
