import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  

  test: {
    globals: true, // Allows using 'describe', 'it' without importing
    environment: "node", // Ensures Vitest doesn't try to use jsdom
    setupFiles: ['./src/test/index.ts'],
    server:{
      deps: {
        inline: ['generated/prisma'] 
        }
    }
  },
});
