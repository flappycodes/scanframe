import react from '@vitejs/plugin-react'
import { loadEnv, defineConfig, type Plugin } from 'vite'
import blobUploadHandler from './api/blob-upload.js'
import blobSessionHandler from './api/blob-session.js'
import blobDeleteHandler from './api/blob-delete.js'
import downloadLogHandler from './api/download-log.js'

const localApiHandlers = new Map([
  ['/api/blob-upload', blobUploadHandler],
  ['/api/blob-session', blobSessionHandler],
  ['/api/blob-delete', blobDeleteHandler],
  ['/api/download-log', downloadLogHandler],
])

function localBlobUploadApi(): Plugin {
  return {
    name: 'local-blob-upload-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const host = req.headers.host ?? 'localhost'
        const url = new URL(req.url ?? '/', `http://${host}`)
        const handler = localApiHandlers.get(url.pathname)
        if (!handler) return next()

        try {
          let body = ''
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            for await (const chunk of req) body += chunk.toString()
          }

          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined || key === 'content-length' || key === 'transfer-encoding') continue
            if (Array.isArray(value)) value.forEach((item) => headers.append(key, item))
            else headers.set(key, value)
          }

          const request = new Request(url, {
            method: req.method ?? 'POST',
            headers,
            body: body || undefined,
          })
          const response = await handler.fetch(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Local upload endpoint failed.' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (!process.env.BLOB_READ_WRITE_TOKEN && env.BLOB_READ_WRITE_TOKEN) {
    process.env.BLOB_READ_WRITE_TOKEN = env.BLOB_READ_WRITE_TOKEN
  }
  if (!process.env.BLOB_STORE_ID && env.BLOB_STORE_ID) {
    process.env.BLOB_STORE_ID = env.BLOB_STORE_ID
  }

  return {
    plugins: [react(), localBlobUploadApi()],
  }
})
