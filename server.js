import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 8080
const HOST = '0.0.0.0'
// Host only — no /api suffix. Proxy forwards /api/* → ${API_TARGET}/api/*
const API_TARGET = (
  process.env.API_TARGET || 'https://taskbackend-oiuia.ondigitalocean.app'
).replace(/\/$/, '')

const app = express()

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(
  '/api',
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    secure: false,
  }),
)

const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`)
})
