# RA 8293 — The Intellectual Property Code, Annotated for Developers

An animated, responsive site covering all 14 required topics on Republic Act No. 8293
(Intellectual Property Code of the Philippines). Plain HTML, CSS and JavaScript — no build step.
Section citations follow the primary text: https://www.lawphil.net/statutes/repacts/ra1997/ra_8293_1997.html

## Structure
- `index.html` — all 14 sections
- `css/style.css` — design system
- `js/main.js` — animations and interactive tools
- `assets/vendor/` — GSAP + ScrollTrigger, Lenis, SplitType, vanilla-tilt (bundled locally, licenses included)
- `assets/fonts/` — Fraunces, Instrument Sans, JetBrains Mono (self-hosted, SIL OFL)

## Run locally
Open `index.html`, or run `npx serve .`

## Deploy: GitHub
```
git init
git add .
git commit -m "RA 8293 IP website"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

## Deploy: Vercel
1. vercel.com → Add New Project → import the GitHub repo.
2. Framework Preset: **Other**. Leave build command and output directory empty.
3. Deploy. Submit the GitHub repo link and the live `*.vercel.app` URL.

Educational summary, not legal advice.
