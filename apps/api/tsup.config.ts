import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/test-mongo.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'node20',
  sourcemap: true,
  splitting: false,
  noExternal: [
    'dotenv',
    '@repo/logger',
    '@bull-board/express',
    'winston'
  ],
  outExtension({ format }) {
    return {
      js: `.js`
    }
  },
  banner: {
    js: `import { createRequire } from 'module';
const require = createRequire(import.meta.url);`
  },
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
})