// vite.config.ts
import react from '@vitejs/plugin-react';
import {
  defineConfig,
  loadEnv,
  type ConfigEnv,
  type PluginOption,
  type ProxyOptions,
} from 'vite';

/** Proxy interno para descargar archivos de Monday/S3 evitando CORS */
function mondayFileProxy(): PluginOption {
  return {
    name: 'monday-file-proxy',
    configureServer(server) {
      server.middlewares.use('/proxy-file', async (req, res) => {
        try {
          const url = new URL(req.url!, 'http://localhost');
          const remote = url.searchParams.get('u');
          if (!remote) {
            res.statusCode = 400;
            res.end('Missing "u" param');
            return;
          }

          const needsAuth = remote.includes('monday.com/protected_static');
          const headers: Record<string, string> = {};
          if (needsAuth && process.env.MONDAY_TOKEN) {
            headers.Authorization = process.env.MONDAY_TOKEN!;
          }

          const upstream = await fetch(remote, { headers });
          res.statusCode = upstream.status;
          for (const [k, v] of upstream.headers) res.setHeader(k, v);
          res.end(Buffer.from(await upstream.arrayBuffer()));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(e?.message || 'proxy error');
        }
      });
    },
  };
}

export default defineConfig(({ mode }: ConfigEnv) => {
  // Carga variables .env/.env.local
  const env = loadEnv(mode, process.cwd(), '');

  // Variables SOLO servidor (no expuestas al browser)
  process.env.MONDAY_TOKEN = env.MONDAY_TOKEN?.trim();
  const MONDAY_API = (env.MONDAY_API || 'https://api.monday.com/v2').trim();

  return {
    plugins: [react(), mondayFileProxy()],
    server: {
      proxy: {
        '/monday': {
          target: MONDAY_API,
          changeOrigin: true,
          secure: true,
          rewrite: p => p.replace(/^\/monday/, ''),
          configure: proxy => {
            proxy.on('proxyReq', proxyReq => {
              if (process.env.MONDAY_TOKEN) {
                // Enviamos el token al GraphQL de Monday desde el servidor de Vite
                proxyReq.setHeader('Authorization', process.env.MONDAY_TOKEN!);
              }
              proxyReq.setHeader('Content-Type', 'application/json');
            });
          },
        } as ProxyOptions,
      },
    },
  };
});
