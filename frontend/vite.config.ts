import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        popup: path.resolve(__dirname, 'popup.html'),
        background: path.resolve(__dirname, 'public/background.js')
      },
      output: {
        entryFileNames: (chunk) => {
          return chunk.name === 'background' ? '[name].js' : 'assets/[name]-[hash].js';
        },
        manualChunks(id) {
          // Popup-specific code and minimal dependencies
          if (id.includes('popup.tsx') || id.includes('PopupMenu.tsx') || 
              (id.includes('components/ui') && id.includes('button.tsx'))) {
            return 'popup';
          }
          // Main app features
          if (id.includes('pages/') || id.includes('components/dashboard/')) {
            return 'app';
          }
          // Core React dependencies
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // UI framework dependencies
          if (id.includes('@radix-ui/') || id.includes('lucide-react')) {
            return 'vendor-ui';
          }
          // Other dependencies
          if (id.includes('node_modules')) {
            return 'vendor-deps';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
