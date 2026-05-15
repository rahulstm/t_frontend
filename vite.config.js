import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const defaultApiTarget = 'https://taskbackend-oiuia.ondigitalocean.app'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || defaultApiTarget

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
