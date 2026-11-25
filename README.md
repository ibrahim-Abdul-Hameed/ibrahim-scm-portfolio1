# Ibrahim Abdul Hameed — Procurement & SCM portfolio

A one-page, cricket-themed portfolio for a Procurement Executive / SCM Analyst. The sections are laid out like a match: Toss & Opening, Player Profile, Game Plan, The Delivery (P2P cycle), Innings Highlights, Career Scorecard, Awards and The Final Over.

## Tech
- Plain HTML, CSS and vanilla JavaScript. No framework and no build step.
- Netlify static hosting, with images served through the Netlify Image CDN (`/.netlify/images`).

## Structure
- `public/index.html`: page content
- `public/styles.css`: theme and all animations
- `public/main.js`: interactions (preloader, reveals, counters, tilt, cursor, particle canvas, skill filter)
- `public/img/`: profile photo and background
- `public/files/`: downloadable resume PDF

## Run locally
```bash
netlify dev --port 8889
```
Or open `public/index.html` through any static server. Images use the Image CDN path, so `netlify dev` gives the most accurate preview.
