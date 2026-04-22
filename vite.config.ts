import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/angahack/',
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    alias: {
      assets: '/src/assets',
      components: '/src/components',
      constants: '/src/constants',
      contexts: '/src/contexts',
      data: '/src/data',
      hooks: '/src/hooks',
      interfaces: '/src/interfaces',
      mocks: '/src/mocks',
      services: '/src/services',
      snippets: '/src/snippets',
      utils: '/src/utils',
    },
  },
});
