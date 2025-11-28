import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const entryMap: Record<string, string> = {
    customer: path.resolve(__dirname, 'index-customer.html'),
    shop: path.resolve(__dirname, 'index-shop.html'),
    worker: path.resolve(__dirname, 'index-worker.html'),
    admin: path.resolve(__dirname, 'index-admin.html'),
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        input: entryMap[mode] || path.resolve(__dirname, 'index.html'),
      },
    },
  };
});
