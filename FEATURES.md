# department of useless affairs: features

A pixel-art bureaucracy simulator for the Stupid Ideas Hackathon (Ottawa). Submit a pointless request, and it gets processed by 7 departments. Most will say no.

## Core flow

- **Request input:** type anything, or leave it blank to use the default, "can i blink?".
- **Example buttons:** one-click requests such as "can i eat another chip?" and "am i legally allowed to go to bed?".
- **Request cleanup:** phrases like "can i", "may i", "am i allowed to" and "i want to" are stripped, so the action reads naturally on the certificate. An empty request becomes "do absolutely nothing".
- **7 departments:** each has its own clerk colour, rejection lines and approval lines.
  - bureau of preliminary paperwork
  - ministry of minor bodily autonomy
  - department of snack oversight
  - office of gravity compliance
  - bureau of sitting & standing
  - ministry of vibes
  - supreme council of final stamps
- **Always 4 rejections:** exactly 4 of the first 6 departments reject, picked at random. The supreme council always approves, so every request ends in a certificate.

## Animated scene

- A canvas scene with pixel-art clerks and a character who walks from desk to desk.
- Each department stamps the request approved or rejected.
- The scene celebrates when the request is finally granted.
- Dialogue appears with a typewriter effect in a caption box that names the speaker.

## Jokes

- **Request-aware rejections:** if the request mentions certain topics, a matching rejection line replaces a generic one. Topics covered:
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
- **Request echoed back:** some lines include the user's own request, such as `"{req}" gave the committee a bad feeling.`

## Certificate

- A "certificate of provisional permission" with a seal, the request, and a stamp list showing each department's verdict.
- Standard terms: valid for 4 minutes, non-transferable, void if enjoyed, and a random processing fee.
- Signed by the minister of final stamps.
- **Copy result:** a button that copies a plain-text summary to the clipboard for sharing.

## Sound

- Typewriter blips while text appears.
- A low buzz on rejection and a high chime on approval.
- A short jingle when the certificate appears.
- A `sound: on/off` toggle.
- Sounds are generated with the Web Audio API, so there are no audio assets.

## Dev and demo helpers

- `?fast` skips all animation delays and sound.
- `?req=can%20i%20blink` auto-runs a request on page load. It can be combined with `?fast`, for example `?fast&req=can%20i%20blink`.

## Tech

- Vite and TypeScript, with no runtime dependencies.
- Canvas 2D for the scene, with `image-rendering: pixelated`.
- Fonts: Press Start 2P and VT323 from Google Fonts.
- Under 5 kB of gzipped JavaScript.

## Ideas not built yet

- Deploy to GitHub Pages or Netlify.
- Mobile layout pass.
- Easter egg: a department rejects you twice.
- Download the certificate as an image.
