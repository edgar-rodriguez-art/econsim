import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages deployment, set base to '/YOUR_REPO_NAME/'
// e.g. base: '/econsim/'
// For Vercel or root deployment, use './' or '/'
export default defineConfig({
  plugins: [react()],
  base: './',
});
