# AI Alo — Portfolio

Personal portfolio for **Aloysious Kabonge** (aialo.io).

Static site: HTML, CSS, and a small interaction script. No build step.

## Preview locally

From this folder:

```bash
# Python
python -m http.server 8080

# or Node
npx serve .
```

Then open `http://localhost:8080`.

Or open `index.html` directly in a browser.

## Structure

| File | Role |
|------|------|
| `index.html` | Content & sections |
| `style.css` | Design system (CSS variables) |
| `script.js` | Nav, accordions, interest tiles, scroll progress |
| `photo.jpg` | Hero portrait |
| `favicon.svg` | Favicon |
| `CNAME` | Custom domain for GitHub Pages |

## Design notes

Light editorial system inspired by Stripe / Linear / Vercel craft:
monochrome base, one teal accent, Syne + Source Sans 3, hairline dividers,
editorial rows over card grids, and subtle micro-interactions (not game UI).
