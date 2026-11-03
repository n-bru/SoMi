#!/usr/bin/env python3
"""Baut die Beta von SoMi aus quelle/somi.html in beta/.
Aufruf (im Repo-Ordner): python3 werkzeuge/beta-bauen.py <cache-name, z. B. somi-beta-0.1.0>
Die Beta speichert unter einem eigenen Schlüssel, echte Daten der Hauptversion bleiben unberührt."""
import sys, re, shutil, pathlib
repo = pathlib.Path(__file__).resolve().parent.parent; cache = sys.argv[1]
assert cache.startswith("somi-beta"), "Cache-Name muss mit somi-beta beginnen"
s = (repo / "quelle" / "somi.html").read_text()
def rep(old, new):
    global s
    assert old in s, old
    s = s.replace(old, new, 1)
rep('const KEY="somi-v1";', 'const KEY="somi-beta";')
rep('indexedDB.open("somi",1)', 'indexedDB.open("somi-beta",1)')
rep('<title>SoMi</title>', '<title>SoMi Beta</title>')
rep('content="SoMi">', 'content="SoMi Beta">')
s = re.sub(r'const SOMI_VERSION="([^"]+)"', r'const SOMI_VERSION="\1 Beta"', s, count=1)
rep('</style>', '.betab{position:fixed;top:calc(env(safe-area-inset-top) + 6px);right:10px;z-index:50;background:var(--sig,#e3a008);color:#2b2420;font:700 .7rem/1 system-ui,sans-serif;letter-spacing:.06em;padding:5px 8px;border-radius:8px;pointer-events:none}@media print{.betab{display:none}}\n</style>')
rep('<body>', '<body><div class="betab" aria-label="Beta-Version">BETA</div>')
out = repo / "beta"; out.mkdir(exist_ok=True)
(out / "index.html").write_text(s)
for f in ["icon-180.png", "icon-192.png", "icon-512.png"]:
    shutil.copy(repo / "quelle" / "icons" / f, out / f)
m = (repo / "manifest.webmanifest").read_text().replace('"name":"SoMi","short_name":"SoMi"', '"name":"SoMi Beta","short_name":"SoMi Beta"')
assert "SoMi Beta" in m
(out / "manifest.webmanifest").write_text(m)
sw = (repo / "sw.js").read_text()
sw = re.sub(r'const C="[^"]+"', f'const C="{cache}"', sw, count=1)
# Beta-sw.js löscht nur eigene alte Beta-Caches
old = 'k!==C&&k.startsWith("somi-")&&!k.startsWith("somi-beta")'
assert old in sw
sw = sw.replace(old, 'k!==C&&k.startsWith("somi-beta")')
(out / "sw.js").write_text(sw)
print("Beta gebaut:", out, cache)
