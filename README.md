# department of useless affairs

Submit your most pointless request. It gets processed by 7 departments. Most will say no. Built for the Stupid Ideas Hackathon (Ottawa).

See [FEATURES.md](FEATURES.md) for the full feature list.

## Run it

```sh
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build into dist/
```

Handy URLs while developing:

- `/?fast` skips animations and sound.
- `/?req=can%20i%20blink` auto-runs a request.
- `/?fast&req=can%20i%20blink` does both, which is good for screenshots.

---

## Brief for Codex: make the pitch slideshow

**Task:** build a short pitch slideshow (8 to 10 slides) for this project, to present at the hackathon. Use AI-generated images for the visuals.

**The joke the slideshow plays:** the pitch is delivered completely straight, as if this were a serious government service. The deadpan is the comedy. The product is silly, and the deck should not be.

### Visual style

- **Photos look real.** Generate photorealistic, slightly dull, fluorescent-lit government office photography: beige cubicles, filing cabinets, stacks of forms, wall clocks, laminated signs, rubber stamps, paper trays, water-cooler corners. Think "stock photo of a municipal office," shot on a mid-range camera, flat lighting, slightly desaturated. No fantasy, no cartoon look, no obvious AI gloss.
- **Pixel-art accents.** The app itself is colourful pixel art (Press Start 2P and VT323 fonts, yellow-pink-blue gradient, thick black borders with hard drop shadows). Use real app screenshots next to the photos so the contrast is part of the joke.
- **Palette:** ink `#2a1f14`, paper `#fffaf0`, pink `#ff5a5f`, violet `#6c4ff0`, yellow `#ffd23f`.
- **Type:** Press Start 2P for titles, VT323 for body text.
- **Layout:** one idea per slide, a large image, and at most two short lines of text, all lowercase to match the app. No bullet walls.
- **Image consistency:** keep the same office, lighting and colour grade across all generated images so they feel like one photo shoot. Reuse one base prompt and vary only the subject.

### Suggested slides

1. **Title:** "department of useless affairs." Image: the exterior of a drab government building with a small sign. Subtitle: "a service nobody asked for."
2. **The problem:** "citizens are doing things without permission." Image: a person blinking at a desk, looking unsure. Line: "every day, millions of people blink. unsupervised."
3. **The solution:** "7 departments. 4 rejections. 1 certificate." Image: a corridor with 7 numbered office doors.
4. **Meet the departments:** one office photo with seven small labelled callouts (paperwork, bodily autonomy, snacks, gravity, sitting & standing, vibes, final stamps).
5. **Live demo:** a real screenshot of the app mid-request. Cut to the app live here.
6. **The certificate:** a photo of a framed certificate on an office wall, with the app's real certificate beside it. Line: "valid for 4 minutes. void if enjoyed."
7. **How it works (briefly):** "vite, typescript, canvas, web audio. under 5 kb of javascript. zero dependencies. zero purpose." Image: a server room or a filing cabinet labelled "javascript."
8. **Testimonials (fake, clearly absurd):** "i blinked with permission for the first time." A stock-photo-style portrait of a smiling office worker. Label them as fictional in small print.
9. **Roadmap:** "q1: reject you twice. q2: a form for the form." Image: a very tall stack of paper.
10. **Thank you:** "your request has been received. please wait 6 to 8 business years." Image: an empty waiting room with a ticket dispenser.

### Image generation prompts

Use this base for every photo and swap in the subject:

> Photorealistic photo of {subject}, inside a drab municipal government office, fluorescent ceiling lighting, beige walls, slightly desaturated colour grade, shot on a mid-range DSLR, 35mm, shallow depth of field, mundane and bureaucratic mood, no text unless specified, no people unless specified.

Example subjects:

- a long corridor with seven identical numbered office doors
- a desk with a rubber stamp, an ink pad and a tall stack of forms
- a wall clock above a filing cabinet, with a handwritten "back in 5 min" note
- a laminated sign reading "please take a number" next to a ticket dispenser
- a framed certificate on a beige wall beside a dying office plant
- an empty waiting room with plastic chairs bolted together

### Rules

- Do not use real logos, real government crests or seals, or real people's likenesses. Invent a generic crest if one is needed.
- Label the testimonial people as fictional.
- Keep the deck readable on a projector: large type, high contrast.
- Deliver as a self-contained deck (HTML or PPTX) with images in an `assets/` folder, plus the list of prompts used for each image.
- Take app screenshots from the running app using `?fast&req=...` rather than mocking them up.
