# department of useless affairs 🏛️

submit your most pointless request. it gets processed by 7 departments. most will say no. built for the stupid ideas hackathon (ottawa).

see [FEATURES.md](FEATURES.md) for the full feature list.

## run it

```sh
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build into dist/
```

handy urls while developing:

- `/?fast` skips animations and sound.
- `/?req=can%20i%20blink` auto-runs a request.
- `/?fast&req=can%20i%20blink` does both, which is good for screenshots.

---

## brief for codex: make the pitch slideshow

**task:** build a short pitch slideshow (8 to 10 slides) for this project, to present at the hackathon. use ai-generated images for the visuals.

**the joke the slideshow plays:** the pitch is delivered completely straight, as if this were a serious government service. the deadpan is the comedy. the product is silly, and the deck should not be.

### visual style

- **photos look real.** generate photorealistic, slightly dull, fluorescent-lit government office photography: beige cubicles, filing cabinets, stacks of forms, wall clocks, laminated signs, rubber stamps, paper trays, water-cooler corners. think "stock photo of a municipal office," shot on a mid-range camera, flat lighting, slightly desaturated. no fantasy, no cartoon look, no obvious ai gloss.
- **pixel-art accents.** the app itself is colourful pixel art (press start 2p and vt323 fonts, yellow-pink-blue gradient, thick black borders with hard drop shadows). use real app screenshots next to the photos so the contrast is part of the joke.
- **palette:** ink `#2a1f14`, paper `#fffaf0`, pink `#ff5a5f`, violet `#6c4ff0`, yellow `#ffd23f`.
- **type:** press start 2p for titles, vt323 for body text.
- **layout:** one idea per slide, a large image, and at most two short lines of text, all lowercase to match the app. no bullet walls.
- **image consistency:** keep the same office, lighting and colour grade across all generated images so they feel like one photo shoot. reuse one base prompt and vary only the subject.

### suggested slides

1. **title:** "department of useless affairs." image: the exterior of a drab government building with a small sign. subtitle: "a service nobody asked for."
2. **the problem:** "citizens are doing things without permission." image: a person blinking at a desk, looking unsure. line: "every day, millions of people blink. unsupervised."
3. **the solution:** "7 departments. 4 rejections. 1 certificate." image: a corridor with 7 numbered office doors.
4. **meet the departments:** one office photo with seven small labelled callouts (paperwork, bodily autonomy, snacks, gravity, sitting & standing, vibes, final stamps).
5. **live demo:** a real screenshot of the app mid-request. cut to the app live here.
6. **the certificate:** a photo of a framed certificate on an office wall, with the app's real certificate beside it. line: "valid for 4 minutes. void if enjoyed."
7. **how it works (briefly):** "vite, typescript, canvas, web audio. under 5 kb of javascript. zero dependencies. zero purpose." image: a server room or a filing cabinet labelled "javascript."
8. **testimonials (fake, clearly absurd):** "i blinked with permission for the first time." a stock-photo-style portrait of a smiling office worker. label them as fictional in small print.
9. **roadmap:** "q1: reject you twice. q2: a form for the form." image: a very tall stack of paper.
10. **thank you:** "your request has been received. please wait 6 to 8 business years." image: an empty waiting room with a ticket dispenser.

### image generation prompts

use this base for every photo and swap in the subject:

> photorealistic photo of {subject}, inside a drab municipal government office, fluorescent ceiling lighting, beige walls, slightly desaturated colour grade, shot on a mid-range dslr, 35mm, shallow depth of field, mundane and bureaucratic mood, no text unless specified, no people unless specified.

example subjects:

- a long corridor with seven identical numbered office doors
- a desk with a rubber stamp, an ink pad and a tall stack of forms
- a wall clock above a filing cabinet, with a handwritten "back in 5 min" note
- a laminated sign reading "please take a number" next to a ticket dispenser
- a framed certificate on a beige wall beside a dying office plant
- an empty waiting room with plastic chairs bolted together

### rules

- do not use real logos, real government crests or seals, or real people's likenesses. invent a generic crest if one is needed.
- label the testimonial people as fictional.
- keep the deck readable on a projector: large type, high contrast.
- deliver as a self-contained deck (html or pptx) with images in an `assets/` folder, plus the list of prompts used for each image.
- take app screenshots from the running app using `?fast&req=...` rather than mocking them up.
