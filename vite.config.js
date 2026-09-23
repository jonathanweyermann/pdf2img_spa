import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Production endpoints (also baked into envs/production/.env). Used as the
// local dev fallback so `yarn start` works without any .env file.
const DEFAULT_API_URL = 'https://hhpqexikoj.execute-api.us-west-2.amazonaws.com/production/prodpdfs';
const DEFAULT_BUCKET_ORIGIN = 'https://quiztrainer-quiz-images-prod.s3.us-west-2.amazonaws.com';

// The API and bucket only allow the production origin via CORS, so in dev we
// proxy both through the Vite server and drop the browser's Origin header.
const stripOrigin = (proxy) => {
  proxy.on('proxyReq', (proxyReq) => {
    proxyReq.removeHeader('origin');
    proxyReq.removeHeader('referer');
  });
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');
  const api = new URL(env.REACT_APP_API_URL || DEFAULT_API_URL);

  return {
    plugins: [react()],
    envPrefix: ['REACT_APP_', 'VITE_'],
    server: {
      port: 3000,
      proxy: {
        '/__api': {
          target: api.origin,
          changeOrigin: true,
          rewrite: () => api.pathname,
          configure: stripOrigin,
        },
        '/__s3': {
          target: DEFAULT_BUCKET_ORIGIN,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__s3/, ''),
          configure: stripOrigin,
        },
      },
    },
    build: {
      outDir: 'build',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          // Ship the pdf.js worker as .js: S3 may not serve .mjs with a
          // JavaScript MIME type, which module workers require.
          assetFileNames: (asset) => {
            const name = (asset.names && asset.names[0]) || asset.name || '';
            return name.endsWith('.mjs') ? 'assets/[name]-[hash].js' : 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js',
      css: false,
      env: {
        REACT_APP_API_URL: 'https://api.test/prodpdfs',
        REACT_APP_IMAGE_BUCKET: 'https://bucket.test/',
      },
    },
  };
});
