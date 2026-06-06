#!/usr/bin/env python3
"""Bundle the modular deck into a single standalone presentation.html
(fonts embedded as base64, content + store + renderer inlined)."""
import base64, re, pathlib
root = pathlib.Path(__file__).parent
GFONTS = ("https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@300;400;500;600;700"
          "&family=Noto+Serif+Georgian:wght@400;500;600&display=swap")

css = (root / "style.css").read_text(encoding="utf-8")
def inline(m):
    data = base64.b64encode((root / m.group(1)).read_bytes()).decode()
    return "url('data:font/woff2;base64,%s') format('woff2')" % data
css = re.sub(r"url\('(fonts/FiraGO-[A-Za-z]+\.woff2)'\) format\('woff2'\)", inline, css)

slides = (root / "slides.js").read_text(encoding="utf-8")
store  = (root / "store.js").read_text(encoding="utf-8")
deck   = (root / "deck.jsx").read_text(encoding="utf-8")

html = f"""<!doctype html>
<html lang="ka">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AI მენეჯერებისთვის · ALTE University · 2026</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{GFONTS}" rel="stylesheet">
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>
<style>
{css}
</style>
</head>
<body>
<div id="root"></div>
<script>
{slides}
</script>
<script>
{store}
</script>
<script type="text/babel" data-presets="react">
{deck}
</script>
</body>
</html>
"""
out = root / "presentation.html"
out.write_text(html, encoding="utf-8")
em = html.count("—") + html.count("–")
print(f"presentation.html: {len(html)//1024} KB  | long-dashes: {em}")
