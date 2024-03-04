import { defineConfig } from 'tsup';

export default defineConfig([
  {
    clean: true,
    dts: true,
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    target: 'esnext',
    outDir: 'dist'
  },
  {
    clean: true,
    entry: ['scripts/*.ts'],
    format: ['esm'],
    target: 'esnext',
    outDir: 'dist/scripts'
  }
]);
