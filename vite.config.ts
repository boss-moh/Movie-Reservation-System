import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  

  test: {
    isolate: true, // Ensures each test file runs in a separate environment
    globals: true, // Allows using 'describe', 'it' without importing
    environment: "node", // Ensures Vitest doesn't try to use jsdom
    maxWorkers: 1,
    setupFiles: ['./src/test/index.ts'],
    server:{
      deps: {
        inline: ['generated/prisma'] 
        }
    },
    exclude: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  },
  
});
