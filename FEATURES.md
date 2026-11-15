# department of useless affairs: features

a pixel-art bureaucracy simulator for the stupid ideas hackathon (ottawa). submit a pointless request, and it gets processed by 7 departments. most will say no.

## core flow

- **request input:** type anything, or leave it blank to use the default, "can i blink?".
- **example buttons:** one-click requests such as "can i eat another chip?" and "am i legally allowed to go to bed?".
- **request cleanup:** phrases like "can i", "may i", "am i allowed to" and "i want to" are stripped, so the action reads naturally on the certificate. an empty request becomes "do absolutely nothing".
- **7 departments:** each has its own clerk colour, rejection lines and approval lines.
  - bureau of preliminary paperwork
  - ministry of minor bodily autonomy
  - department of snack oversight
  - office of gravity compliance
  - bureau of sitting & standing
  - ministry of vibes
  - supreme council of final stamps
- **always 4 rejections:** exactly 4 of the first 6 departments reject, picked at random. the supreme council always approves, so every request ends in a certificate.

## animated scene

- a canvas scene with pixel-art clerks and a character who walks from desk to desk.
- each department stamps the request approved or rejected.
- the scene celebrates when the request is finally granted.
- dialogue appears with a typewriter effect in a caption box that names the speaker.

## jokes

- **request-aware rejections:** if the request mentions certain topics, a matching rejection line replaces a generic one. topics covered:
  - blinking or eyes
  - snacks and food
  - sleep
  - standing, sitting and walking
  - breathing
  - crying and feelings
  - dancing and running
  - talking
  - phones and the internet
  - coffee, tea and water
  - thinking and remembering
- **request echoed back:** some lines include the user's own request, such as `"{req}" gave the committee a bad feeling.`

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
