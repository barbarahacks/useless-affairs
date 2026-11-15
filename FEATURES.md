# tracker

what we are doing on department of useless affairs (stupid ideas hackathon, ottawa, ai track). new features and building blocks get a github issue, closed by the commit that does it. style tweaks, small fixes, readme and tracker edits do not.

## done

- [x] core flow: request in, 7 departments stamp it one by one, certificate or notice of refusal out
- [x] government portal look: case file, letterhead certificate, office canvas scene, corporate stickers
- [x] departments picked from the request (#4)
- [x] random judging, and the final council can refuse (#5)
- [x] office sounds (#11)

## next up

- [x] stupid features, one at a time:
  - [x] ottawa news ticker (#17)
  - [x] voices read the verdicts: 4 languages, an alien, clear english, a singing council (#18)
  - [x] fines (#20)
  - [x] follow-up question (#25)
- [x] deployed on netlify, with claude: https://useless-affairs.netlify.app (#30)
- [x] mobile: site works and voices play on iphone safari (reception speaks in the tap to unlock speech)

## claude (#29)

- [x] `server/case.ts`: claude writes the 6 departments, their lines and the follow-up question
- [x] served from the dev server at `/api/case`; locally it signs in through `ant auth login`
- [x] falls back to the backup clerk (the old dummy) on no key, error or a 9s timeout
- [x] tested: about 3.6s and $0.027 per request (opus 5.5, fast mode, medium effort)
- [x] netlify function for `/api/case` on deploy, 10 cases per visitor per minute (#30)

## ideas: stupid features

- **take a number:** before processing you get "you are no. 312,860". it counts down fast, then sticks at 2 until you click "i am still here".
- **hold music:** elevator muzak while you wait, cut in by "your request is important to us".
- **cookie banner:** "accept all" and "reject all" both lead to "your cookie preference has been rejected".
- **permission that expires:** the certificate's "valid for 4 minutes" is a live countdown. at zero it gets stamped expired: "please reapply".
- **appeal:** a refusal gets an appeal button. the same departments reject faster, and the next form is an appeal of the appeal.
- **in triplicate:** sometimes you must re-enter the request 3 times. the third box is upside down, and they have to match.
- **sign here:** draw a signature with the mouse. it gets rejected: "does not match the signature we made up for you".
- **out of office:** sometimes a department is on strike or on a coffee break. its desk is empty and the paper gets an auto-reply.
- **wrong department:** sometimes a desk says "this isn't our department" and the paper goes back to desk 1, once.
- **terms and conditions:** a huge scroll box. the agree checkbox only unlocks at the bottom, and the scroll bar keeps growing.
- **lunch break:** every few minutes the site closes for a 10-second lunch break and a "closed" sign covers the form.
- **progress bar:** goes to 99%, then backwards.
- **satisfaction survey:** any star rating is "rounded to 2.1. thank you."
- **stamp cursor:** click anywhere on the site to stamp "rejected" on the page itself.
- **permits wallet:** your certificates are kept on the device. all of them have expired.

### more ideas, dumber

- **office hours are real:** judging depends on your actual clock. before 10am nothing gets approved (no coffee yet). 12–1 the desks are empty. after 4:55pm everything is approved instantly: "we just want to go home".
- **closed on weekends:** on saturday and sunday the whole site is closed. the hackathon is on a weekend, so judges get a tiny "open anyway (judges only)" link.
- **dark mode by application:** the dark mode toggle is a request. you submit "can i have dark mode?", it goes through the departments, and if approved you get dark mode for 4 minutes.
- **the stamp runs out of ink:** each stamp is fainter than the last. by desk 7 it's barely visible: "ink requisition rejected".
- **rejection loyalty program:** "you have been rejected 12 times. you are now a gold member. gold members are rejected faster."
- **legalese:** your request is rewritten as a formal title. "can i blink" becomes "application for temporary voluntary ocular closure (form oc-1)". good for the claude version later.
- **receipt:** a thermal receipt prints out of the bottom of the page, far too long, itemising "1x hope ... $0.00" and "rejection handling fee ... $4.00".
- **mandatory meeting:** at random, every clerk walks to the middle of the floor, nothing happens for 10 seconds, and they walk back. "this meeting could have been an email."
- **unread memos:** the top bar shows "you have 4,019 unread memos", and it goes up every time a department cc's another one.
- **request password rules:** your request must contain a number, a department name and a feeling. it must not contain capital letters, which are not permitted on this website.
- **are you sure?** five in-page confirmations, each one more unsure. on the last one, yes and no swap places.
- **the submit button gets shy:** when the ministry of vibes is in a mood, the button slides away from your cursor.

### even more ideas

- **monotone voice:** each department reads its verdict out loud in a flat government voice (browser speech synthesis, slow and low, no assets).
- **ottawa news ticker:** a scrolling ticker of other citizens' cases. "kanata resident denied permission to sneeze." "permit to skate on the rideau canal under review since 1832."
- **o-train delay:** sometimes processing stops: "your request is delayed. it was sent on the o-train."
- **fines:** you get fined for things as you use the site. typing too fast, hovering too long, using a question mark. they are added to the processing fee.
- **come back:** when you switch tabs, the tab title becomes "your case is unattended" and the icon becomes a red stamp.
- **follow-up question:** a department asks "why do you need to blink?". any answer is "insufficient". good for the claude version later.
- **2fa:** "we've sent a verification code to your fax machine."
- **draft autosave:** "draft saved", then a second later "draft rejected".

## notes

- demo is 60 seconds: features must land fast and not need explaining.
- style: everything lowercase. only `.md` filenames are capitalised.
- repo: `barbarahacks/useless-affairs` via the `github-hackathon` ssh alias.
