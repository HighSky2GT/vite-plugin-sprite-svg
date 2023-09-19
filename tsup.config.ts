import { defineConfig } from 'tsup'

export default defineConfig({
  external: ['fast-glob', 'vite'],
  entry: ['package/core/index.ts'],
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
})
