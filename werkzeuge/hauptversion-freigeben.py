#!/usr/bin/env python3
"""Übernimmt quelle/somi.html als Hauptversion (index.html) und zählt den Offline-Zwischenspeicher hoch.
Nur auf ausdrückliches Kommando der Projektleitung ausführen, nachdem die Beta geprüft ist.
Aufruf (im Repo-Ordner): python3 werkzeuge/hauptversion-freigeben.py <cache-name, z. B. somi-0.2.0>"""
import sys, re, shutil, pathlib
repo = pathlib.Path(__file__).resolve().parent.parent; cache = sys.argv[1]
assert cache.startswith("somi-") and not cache.startswith("somi-beta"), "Cache-Name wie somi-0.2.0"
src = repo / "quelle" / "somi.html"
assert 'const KEY="somi-v1";' in src.read_text(), "Speicher-Schlüssel der Hauptversion fehlt"
shutil.copy(src, repo / "index.html")
for f in ["icon-180.png", "icon-192.png", "icon-512.png"]:
    shutil.copy(repo / "quelle" / "icons" / f, repo / f)
sw = (repo / "quelle" / "sw.js").read_text()
sw, n = re.subn(r'const C="[^"]+"', f'const C="{cache}"', sw, count=1)
assert n == 1
(repo / "sw.js").write_text(sw)
print("Hauptversion übernommen:", cache)
