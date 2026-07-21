import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Firestore compat + telas num app sem code-splitting: chunks maiores são esperados
  build: {
    chunkSizeWarningLimit: 1200,
  },
});
