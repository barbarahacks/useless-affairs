import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
import { handleCaseRequest } from './server/case.ts';

// serves POST /api/case from the dev server, so claude can be called locally without exposing the key
function caseApi(): Plugin {
  return {
    name: 'useless-affairs-case-api',
    configureServer(server) {
      server.middlewares.use('/api/case', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        let raw = '';
        req.on('data', (chunk) => (raw += chunk));
        req.on('end', async () => {
          res.setHeader('content-type', 'application/json');
          try {
            res.end(JSON.stringify(await handleCaseRequest(JSON.parse(raw || '{}'))));
          } catch (err) {
            console.error('[api/case]', err instanceof Error ? err.message : err);
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'could not generate the case' }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // ANTHROPIC_API_KEY from .env.local (gitignored), for the dev server only
  Object.assign(process.env, loadEnv(mode, process.cwd(), 'ANTHROPIC_'));
  return { plugins: [caseApi()] };
});
