import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves at https://<user>.github.io/sysdesign-rpg/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/sysdesign-rpg/' : '/',
  plugins: [react()],
}))
