import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleGeminiRequest } from './_lib/gemini.ts';

/** Vercel serverless function: POST /api/gemini */
type VercelLikeRequest = IncomingMessage & { body?: unknown };
type VercelLikeResponse = ServerResponse & {
  status?: (code: number) => VercelLikeResponse;
  json?: (body: unknown) => void;
};

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  const forwarded = req.headers['x-forwarded-for'];
  const clientKey = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) || req.socket?.remoteAddress || 'unknown';

  const header = (name: string) => {
    const v = req.headers[name];
    return Array.isArray(v) ? v[0] : v;
  };

  // If the visitor leaves or the page cancels, stop the Gemini call instead of letting it run on
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) controller.abort();
  });

  const result = await handleGeminiRequest({
    signal: controller.signal,
    method: req.method,
    body: req.body,
    clientKey: clientKey.trim(),
    headers: { origin: header('origin'), host: header('host'), secFetchSite: header('sec-fetch-site') },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    env: (globalThis as any).process?.env ?? {},
  });

  res.statusCode = result.status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(result.body));
}
