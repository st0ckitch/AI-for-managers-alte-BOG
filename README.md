# AI მენეჯერებისთვის — ALTE × Bank of Georgia

Interactive slide deck (85 slides) on AI for managers, built in the Bank of Georgia
visual language. Georgian UI, FiraGO Mtavruli headlines, light theme, BoG orange.

**Live deck:** open `index.html` — navigate with the **← →** arrow keys (or the on‑screen arrows).
**Content editor:** open `admin.html` — edit any slide's text, preview live, and export.

## Files
| File | Purpose |
|------|---------|
| `index.html` | the presentation (deck) |
| `admin.html` + `admin.jsx` | content editor / admin panel |
| `slides.js` | all slide content (`window.DEFAULT_SLIDES`) |
| `store.js` | localStorage override layer (edits persist per browser) |
| `deck.jsx` | the React slide renderer |
| `style.css` | design system (BoG orange, light theme) |
| `fonts/` | bundled FiraGO (Georgian + Latin) woff2 |
| `presentation.html` | single‑file standalone build (fonts embedded) |
| `build.py` | rebuilds `presentation.html` from the modular files |

## Editing content
1. Open `admin.html` and edit text. **შენახვა** saves to your browser and refreshes the preview.
2. To make changes permanent for everyone, click **⬇ slides.js**, replace the repo's
   `slides.js` with the downloaded file, and commit. (Then run `python3 build.py` to refresh the standalone.)

## Hosting
Served as static files via GitHub Pages — no build step required for the live version.
