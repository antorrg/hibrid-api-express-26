import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/icons/*',
          dest: 'assets/icons', // Ahora dist/assets/icons/*.svg
          rename: { stripBase: true },
        },
        {
          src: 'public/*',
          dest: 'assets',
          rename: { stripBase: true },
        },
        {
          src: 'views',
          dest: '.',
        },
        {
          src: 'robots.txt',
          dest: '.',
        },
      ],
    }),
  ],
  build: {
    manifest: true, // Para que getAssetPath.ts pueda leer dist/.vite/manifest.json
    write: true,
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve('src/main.tsx'), // Punto de entrada React
        scripts: path.resolve('src/files/scripts.js'), // Script adicional para Pug
      },
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: ({ name }) => {
          if (/\.(woff2?|eot|ttf|otf)$/.test(name ?? '')) {
            // Coloca las fuentes en assets/fonts
            return 'assets/fonts/[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
        manualChunks: {
          'bootstrap': ['react-bootstrap'],
          'vendor': ['react', 'react-dom', 'react-router'],
        }
      },
    },
  },
  resolve: {
    alias: {
      '@files': path.resolve('src/files'), // Alias para facilitar la importación
    },
  },
})
