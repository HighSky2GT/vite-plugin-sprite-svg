import { defineConfig } from 'tsup'

export default defineConfig({
  external: ['fast-glob', 'vite'],
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
})
