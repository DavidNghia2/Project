/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { offlineShellPlugin } from './offlineShellPlugin.js'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // A new dev cache avoids Windows EPERM unlink errors from files held by an old session.
  cacheDir: command === 'serve'
    ? mkdtempSync(join(tmpdir(), 'smart-inventory-vite-'))
    : 'node_modules/.cache/vite',
  plugins: [react(), tailwindcss(), offlineShellPlugin()],
  build: {
    emptyOutDir: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 15000,
  },
}))
