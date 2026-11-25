# AGENTS.md

## Overview
A static single-page portfolio (Procurement / SCM, with a cricket theme). Netlify publishes `public/` directly. There is no build step, no package.json and no server code.

## Files
- `public/index.html`: all content. Sections use ids that the nav scroll-spy relies on (`#kickoff`, `#profile`, `#skills`, `#p2p`, `#highlights`, `#timeline`, `#contact`).
- `public/styles.css`: CSS variables in `:root` (lime `--lime`, ball red `--leather`, easing `--ease`). The sections in the file follow the order of the page.
- `public/main.js`: one IIFE. Desktop-only effects (tilt, magnetic buttons, custom cursor, parallax, canvas) run after an early return that checks for reduced motion and a fine pointer.

## Conventions
- Reveal animations: add `.reveal` (fade/slide), `.mask-reveal` with an inner `<span>` (heading wipe) or `.flip`. The IntersectionObserver adds `.visible`. Wrap a group in `.stagger` to get delayed entrances.
- Elements with their own `transition` that also use `.reveal` need the combined rule at the end of `styles.css` (`.card.reveal`, `.event.reveal`). Without it the fade breaks.
- `[data-tilt]` enables 3D tilt. Add `.card-glare` inside for the light sheen. `.magnetic` buttons need an inner `<span>`.
- Skill pills are filtered by `data-cat`. The counts on the tab buttons are hard-coded and must be updated when pills change.
- Scoreboard numbers (`data-to`) are factual counts taken from the page content. Keep them accurate.
- Reference images through `/.netlify/images?url=/img/...&w=...&fm=webp`, not the raw files.
- Respect `prefers-reduced-motion`. The global override at the end of the CSS disables motion, and JS skips the typing, counters and pointer effects.
