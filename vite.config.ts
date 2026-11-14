import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the 3D cinematic documentary website
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
});
