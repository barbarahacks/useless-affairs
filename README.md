# department of useless affairs 🏛️

a government portal that processes your most pointless requests (stupideas ottawa, ai track).

live: https://useless-affairs.netlify.app

type a request like "can i blink?" and claude invents 6 departments for it, each with its own rejection and approval line, plus a follow-up question one of them asks you. the supreme council of final stamps always goes last.

each department stamps it `approved` or `rejected` on its own. the council's stamp decides what you leave with: a certificate of provisional permission or a notice of refusal.

## docs

- `FEATURES.md`: what we are working on and ideas

## setup

```bash
npm install
echo "ANTHROPIC_API_KEY=your-key" > .env.local   # gitignored, read by the dev server only
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
```

restart `npm run dev` after adding or changing the key.

## deploy (netlify)

`netlify.toml` builds the site into `dist/`, and `netlify/functions/case.ts` serves `/api/case` with the same claude code as the dev server. set `ANTHROPIC_API_KEY` in netlify's environment variables. each visitor can make 10 cases a minute.

## demo urls

```
/?fast                         skips animations and sound
/?req=can%20i%20blink          runs a request on load
/?fast&req=can%20i%20blink     both, good for screenshots
```

## fines

you get fined as you use the site. fines show up as a notice slip, add up in the case file, and are added to the certificate.

| trigger | fine |
| --- | --- |
| a `?` in your request | $3.50, unauthorised question mark |
| capital letters in your request | $1.00 each |
| clicking a frequently requested example | $5.00, plagiarism |
| typing 6 keys in under 0.6s | $12.00, excessive typing speed |
| not moving the cursor for 10s while idle | $8.00, loitering |

## the departments

the page posts the request to `/api/case`, which calls claude (`claude-opus-5-5`, low effort, structured output) on the server, so the key never reaches the browser. it runs while reception is talking, to hide the wait.

if there is no key, claude fails, or it takes more than 9 seconds, the backup clerk takes over: local keywords and templates in `src/departments.ts`. the case file says which one routed your request.

## layout

```
index.html          page markup and the stickers
src/main.ts         the flow: case file, typewriter, certificate
src/departments.ts  builds the case and judges it; the backup clerk's departments
src/ai.ts           fetches claude's departments from /api/case
server/case.ts      the claude call (server only)
vite.config.ts      serves /api/case from the dev server
netlify/            the deployed /api/case function, with a rate limit
src/scene.ts        canvas processing floor
src/sprites.ts      pixel sprites
src/sound.ts        web audio office sounds
src/style.css       the government portal look
```
