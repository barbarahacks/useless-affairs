// asks the server (which asks claude) for this request's departments.
// any failure or a slow answer returns null, and the page uses the local dummy generator instead.
import type { AiCase } from './departments.ts';

export async function fetchAiCase(request: string, timeoutMs = 9000): Promise<AiCase | null> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  try {
    const res = await fetch('/api/case', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ request }),
      signal: abort.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<AiCase>;
    const ok =
      Array.isArray(data.departments) &&
      data.departments.length >= 6 &&
      data.departments.every((d) => typeof d?.name === 'string' && typeof d.reject === 'string' && typeof d.approve === 'string') &&
      typeof data.question === 'string';
    return ok ? (data as AiCase) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
