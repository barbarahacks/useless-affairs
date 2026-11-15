// netlify function: serves POST /api/case on the deployed site, with the same claude code as the dev server.
// the api key comes from ANTHROPIC_API_KEY in netlify's environment settings.
import { handleCaseRequest } from '../../server/case.ts';

// a rough guard so strangers can't drain the api credits: 10 cases per visitor per minute.
// it lives in memory, so it resets when netlify starts a fresh instance; good enough for a hackathon.
const LIMIT = 10;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function tooMany(visitor: string): boolean {
  const now = Date.now();
  const recent = (hits.get(visitor) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(visitor, recent);
  return recent.length > LIMIT;
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return new Response(null, { status: 405 });
  const visitor = req.headers.get('x-nf-client-connection-ip') ?? 'unknown';
  if (tooMany(visitor)) return Response.json({ error: 'too many requests' }, { status: 429 });
  try {
    return Response.json(await handleCaseRequest(await req.json()));
  } catch (err) {
    console.error('[api/case]', err instanceof Error ? err.message : err);
    return Response.json({ error: 'could not generate the case' }, { status: 502 });
  }
};

export const config = { path: '/api/case' };
