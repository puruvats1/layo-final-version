import react from '@vitejs/plugin-react';
import path from 'path';
import {existsSync, readFileSync} from 'node:fs';
import dotenv from 'dotenv';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {handleGeminiRequest} from './api/_lib/gemini.ts';

// In dev, serve POST /api/gemini from the same handler the Vercel function uses (api/gemini.ts).
// GEMINI_API_KEY is read from .env.local on the server side and is never exposed to the browser.
const geminiDevApi = (env: Record<string, string>): Plugin => ({
  name: 'kith-gemini-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/gemini', async (req, res) => {
      const send = (status: number, payload: unknown) => {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(JSON.stringify(payload));
      };

      // Prompts are capped at 500 characters, so anything near this size is not the app talking
      const MAX_BODY_BYTES = 8 * 1024;
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of req) {
        size += (chunk as Buffer).length;
        if (size > MAX_BODY_BYTES) return send(413, { error: 'too_large' });
        chunks.push(chunk as Buffer);
      }
      let body: unknown;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      } catch {
        body = undefined;
      }
      const header = (name: string) => {
        const v = req.headers[name];
        return Array.isArray(v) ? v[0] : v;
      };
      // If the page cancels or closes, stop the Gemini call instead of letting it run on
      const controller = new AbortController();
      res.on('close', () => {
        if (!res.writableFinished) controller.abort();
      });
      const result = await handleGeminiRequest({
        signal: controller.signal,
        method: req.method,
        body,
        clientKey: req.socket.remoteAddress ?? 'dev',
        headers: { origin: header('origin'), host: header('host'), secFetchSite: header('sec-fetch-site') },
        env,
      });
      send(result.status, result.body);
    });
  },
});

// Vite lets variables already exported in the OS/shell beat .env files. Here that meant an old
// GEMINI_API_KEY set in Windows user settings silently replaced the key in .env.local, so for the
// server-side AI key the project's own env files take priority (later files win, as in Vite).
const projectEnvFiles = (mode: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const name of ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`]) {
    const file = path.resolve(name);
    if (existsSync(file)) Object.assign(out, dotenv.parse(readFileSync(file)));
  }
  return out;
};

const ollamaProxy = {
  '/ollama': {
    target: process.env.OLLAMA_URL || 'http://localhost:11434',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/ollama/, ''),
    configure: (proxy: any) => proxy.on('proxyReq', (req: any) => req.removeHeader('origin')),
  },
};

export default defineConfig(({mode}) => {
  const env = {...loadEnv(mode, process.cwd(), ''), ...projectEnvFiles(mode)};
  return {
    base: './', // relative, so the built app works from any path (a GitHub Pages project site, for one)
    plugins: [geminiDevApi(env), react()],
    resolve: {
      alias: [
        {find: '@/components', replacement: path.resolve('src/components')},
        {find: '@', replacement: path.resolve('.')},
      ],
    },
    // The local model (Ollama). The browser calls /ollama so a phone on the same network reaches it too.
    // Ollama rejects unknown Origin headers, so the proxy drops it.
    preview: { proxy: ollamaProxy },
    server: {
      proxy: ollamaProxy,
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
