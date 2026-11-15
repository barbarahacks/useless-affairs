# department of useless affairs 🏛️
a government portal that processes your most pointless requests. type something like "can i blink?" and it is routed to 7 departments picked for that request. each one stamps it approved or rejected, and you leave with a certificate of provisional permission or a notice of refusal. built for **stupideas ottawa** as part of the **ai track**.

## tech stack ✨
- **frontend:** vite + typescript, no framework and no runtime dependencies
- **graphics:** canvas 2d for the pixel-art processing floor (clerks, desks, a dying fluorescent light)
- **sound:** web audio api for typewriter clicks, rubber stamps, desk bells and a sad trombone, with no audio files
- **fonts:** ibm plex sans, serif and mono, plus caveat for the handwritten stickers

## features 👾
- **departments picked from your request:** 7 departments per request. topic ones are matched to what you asked ("can i not submit my homework?" goes to the office of the dog that ate it), one is invented from your request's main word, and general bureaucracy fills the remaining seats
- **random judging:** every department decides on its own, and the supreme council of final stamps can refuse the whole thing
- **live case file:** a manila folder tracks each department from pending to in review to stamped, with its reason
- **official certificate:** letterhead, case number, verdict table, a signature that draws itself, and an "approved, reluctantly" stamp that slams down
- **office sounds:** typewriter clicks, stamp thunks, a desk bell or buzzer per verdict, a fanfare or a sad trombone at the end, and a sound on/off toggle
- **corporate stickers:** "iso 9001-ish certified", "employee of the month: the stapler", "caution: synergy in progress" and more, stuck on the page
- **copy result:** copies a plain-text summary of your case to share

## 💭 what I learned
- **canvas pixel art:** drawing sprites from strings and animating them with a tween loop
- **web audio:** building sounds from oscillators and filtered noise, with envelopes so they don't click
- **text routing:** matching a free-text request to relevant departments with keywords and templates

## limitations 🚨
- **dummy generator:** departments and verdict lines come from local keywords and templates, so unusual requests fall back to general departments
- **repetition:** most departments have only a few lines each, so repeat requests start to look familiar
- **desktop first:** stickers only sit in the page margins on wide screens; smaller screens get a notice board instead

## improvements 🌱
- **claude-generated departments:** have claude write the 7 departments and their verdicts for each request, with the local generator as the fallback
- **more bureaucracy:** take-a-number queues, cookie banners that reject you, appeals of appeals, and permissions that expire on screen

## running the project 🏁
to get the project up and running on your local machine, follow these steps:

- **ensure [node.js](https://nodejs.org/en) is installed.**
1. **clone the repository:**
```bash
git clone https://github.com/barbarahacks/useless-affairs.git
```

2. **navigate to the project directory:**
```bash
cd useless-affairs
```

3. **install dependencies:**
```bash
npm install
```

4. **start the development server:**
```bash
npm run dev
```

5. open [http://localhost:5173/](http://localhost:5173/) with your browser.

**handy urls:** `/?fast` skips animations and sound, `/?req=can%20i%20blink` runs a request on load, and `/?fast&req=can%20i%20blink` does both (good for screenshots).
