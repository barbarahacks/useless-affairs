# department of useless affairs: features

a pixel-art bureaucracy simulator for the stupid ideas hackathon (ottawa). submit a pointless request, and it gets routed to the departments relevant to it. most will say no.

## core flow

- **request input:** type anything, or leave it blank to use the default, "can i blink?".
- **example buttons:** one-click requests such as "can i eat another chip?" and "am i legally allowed to go to bed?".
- **request cleanup:** phrases like "can i", "may i", "am i allowed to" and "i want to" are stripped, so the action reads naturally on the certificate. an empty request becomes "do absolutely nothing".
- **departments picked from the request:** each request goes to 7 departments.
  - up to 3 topic departments, matched by keywords in the request. topics: school and homework, food, sleep, the body (blinking, breathing), moving around, work, money, feelings, phones and screens, drinks, talking, and not doing things.
  - examples: "can i not submit my homework?" goes to the ministry of education-adjacent matters, the office of the dog that ate it, and the department of not doing things. snack oversight only shows up for food.
  - 1 department invented from the request's main word, e.g. "standing committee on homework" or "office of chip affairs".
  - general bureaucracy fills the remaining seats (preliminary paperwork, forms about forms, committee for committees, procedural delays, and more).
  - the supreme council of final stamps always goes last.
- **random judging:** each department decides independently, with about a 60% chance of rejection. at least one always says no.
- **the final council can refuse:** about 1 in 4 requests is refused outright, and you get a notice of refusal instead of a certificate.

## animated scene

- a canvas scene with pixel-art clerks and a character who walks from desk to desk.
- each department stamps the request approved or rejected.
- the scene celebrates when the request is finally granted.
- dialogue appears with a typewriter effect in a caption box that names the speaker.

## jokes

- **request-aware lines:** every department has its own rejection and approval lines, and many include the request or its main word.

## certificate

- a "certificate of provisional permission" with a seal, the request, and a stamp list showing each department's verdict.
- standard terms: valid for 4 minutes, non-transferable, void if enjoyed, and a random processing fee.
- signed by the minister of final stamps.
- **copy result:** a button that copies a plain-text summary to the clipboard for sharing.

## sound

- typewriter blips while text appears.
- a low buzz on rejection and a high chime on approval.
- a short jingle when the certificate appears.
- a `sound: on/off` toggle.
- sounds are generated with the web audio api, so there are no audio assets.

## dev and demo helpers

- `?fast` skips all animation delays and sound.
- `?req=can%20i%20blink` auto-runs a request on page load. it can be combined with `?fast`, for example `?fast&req=can%20i%20blink`.

## tech

- vite and typescript, with no runtime dependencies.
- canvas 2d for the scene, with `image-rendering: pixelated`.
- fonts: press start 2p and vt323 from google fonts.
- under 5 kb of gzipped javascript.

## ideas not built yet

- deploy to github pages or netlify.
- mobile layout pass.
- easter egg: a department rejects you twice.
- download the certificate as an image.
