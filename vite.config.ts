// vite.config.ts
import react from '@vitejs/plugin-react'
import {
  defineConfig,
  loadEnv,
  type ConfigEnv,
  type PluginOption,
  type ProxyOptions,
} from 'vite'

import { request as httpsRequest, Agent as HttpsAgent } from 'node:https'
import { request as httpRequest } from 'node:http'
import { URL } from 'node:url'
function mondayFileProxy(allowSelfSigned: boolean): PluginOption {
  const httpsAgent = new HttpsAgent({
    rejectUnauthorized: !allowSelfSigned,
  })

  return {
    name: 'monday-file-proxy',
    configureServer(server) {
      server.middlewares.use('/proxy-file', (req, res) => {
        try {
          const localUrl = new URL(req.url!, 'http://localhost')
          const remoteStr = localUrl.searchParams.get('u')
          if (!remoteStr) {
            res.statusCode = 400
            res.end('Missing "u" param')
            return
          }

          const remote = new URL(remoteStr)
          const isHttps = remote.protocol === 'https:'
          const headers: Record<string, string> = {}
          if (
            remote.href.includes('monday.com/protected_static') &&
            process.env.MONDAY_TOKEN
          ) {
            headers['Authorization'] = process.env.MONDAY_TOKEN!
          }

          const opts: any = {
            method: 'GET',
            hostname: remote.hostname,
            port: remote.port || (isHttps ? 443 : 80),
            path: remote.pathname + remote.search,
            headers,
            agent: isHttps ? httpsAgent : undefined,
          }

          const upstreamReq = (isHttps ? httpsRequest : httpRequest)(
            opts,
            (up) => {
              res.statusCode = up.statusCode || 500
              for (const [k, v] of Object.entries(up.headers)) {
                if (typeof v !== 'undefined') res.setHeader(k, v as any)
              }
              up.pipe(res)
            },
          )

          upstreamReq.on('error', (err) => {
            res.statusCode = 502
            res.end(`proxy error: ${err.message}`)
          })

          upstreamReq.end()
        } catch (e: any) {
          res.statusCode = 500
          res.end(`proxy error: ${e?.message || e}`)
        }
      })
    },
  }
}

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.MONDAY_TOKEN = env.MONDAY_TOKEN?.trim()
  const MONDAY_API = (env.MONDAY_API || 'https://api.monday.com/v2').trim()
  const allowSelfSigned = env.ALLOW_SELF_SIGNED === '1'
  const SIGNER_API = (env.SIGNER_API || 'http://127.0.0.1:8000').trim()

  return {
    plugins: [react(), mondayFileProxy(allowSelfSigned)],
    server: {
      proxy: {
        '/monday': {
          target: MONDAY_API,
          changeOrigin: true,
          secure: !allowSelfSigned,
          rewrite: (p) => p.replace(/^\/monday/, ''),
          headers: process.env.MONDAY_TOKEN
            ? { Authorization: process.env.MONDAY_TOKEN! }
            : {},
        } as ProxyOptions,
        '/signer': {
          target: SIGNER_API,
          changeOrigin: true,
          secure: !allowSelfSigned,
          rewrite: (p) => p.replace(/^\/signer/, ''),
        } as ProxyOptions,
      },
    },
  }
})
