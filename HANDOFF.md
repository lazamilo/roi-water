# ROI Water redesign (pitch)

Static site: `index.html`, `styles.css`, `main.js`, `assets/`. Open with any static server, e.g. `python3 -m http.server 4392` in this folder.

- Type: Maison Neue (Book/Medium/Demi), local files in `assets/fonts` (licensed fonts from the studio desktop, not for public redistribution).
- Motion: GSAP 3.12 + ScrollTrigger, Lenis smooth scroll (CDN). Respects reduced motion.
- Client assets (from roiwater.com): bottle, box packshots, Pegasus mark, ROI WATER wordmark SVG, velvet lifestyle photo, gift card. Originals in `assets/src`.
- Generated with Higgsfield (GPT Image 2.6, upscaled 2K where full-bleed): stage, hills, aquifer, crystals, bubbles, athlete, mom, manager, sleep, pavilion, dinner, glass, bottle-stage (unused alt hero).
- Copy is from the live site and its About page; FAQ answers were written for the pitch and should be checked with the client.
- Shop is a front-end demo (quantity/price switch, toast); not wired to Shopify.

## History section (v2)
Pinned scroll story (`.chron`): the stage is `position:sticky`, each 100vh of scroll moves to the next era. Logic is plain JS in `main.js` ("History scroll story"), no GSAP dependency. Images `assets/img/era-YEAR.jpg` (Higgsfield, upscaled 2K). Year odometer digits size themselves to the glyph width after fonts load. Rail ticks are clickable.
