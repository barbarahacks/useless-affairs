# department of useless affairs 🏛️

a government portal that processes your most pointless requests (stupideas ottawa, ai track).

type a request like "can i blink?" and it is routed to 7 departments picked for it:
- topic departments matched to what you asked ("can i not submit my homework?" goes to the office of the dog that ate it)
- one department invented from the request's main word ("standing committee on homework")
- general bureaucracy for the remaining seats, then the supreme council of final stamps

each department stamps it `approved` or `rejected` on its own. the council's stamp decides what you leave with: a certificate of provisional permission or a notice of refusal.

## docs

- `FEATURES.md`: what we are working on and ideas

## setup

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
```

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

## the departments (dummy for now)

departments and their lines come from local keywords and templates in `src/departments.ts`. the plan is for claude to generate them per request, with this as the fallback.

## layout

```
index.html          page markup and the stickers
src/main.ts         the flow: case file, typewriter, certificate
src/departments.ts  picks the 7 departments and judges the request
src/scene.ts        canvas processing floor
src/sprites.ts      pixel sprites
src/sound.ts        web audio office sounds
src/style.css       the government portal look
```
