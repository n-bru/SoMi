# Übergabe SoMi (Stand 16.11.2026)

## Wo was liegt

| Was | Wo |
|---|---|
| Quelldatei | `quelle/somi.html` |
| Beta | `beta/` (wird gebaut, nicht von Hand ändern) |
| Hauptversion | `index.html`, `sw.js`, `manifest.webmanifest`, Symbole |
| Bauwege | `werkzeuge/beta-bauen.py`, `werkzeuge/hauptversion-freigeben.py` |
| Rauchtest | `tests/rauchtest.js` |
| Bildschirmtest | `tests/bildschirmtest.js` (Fotos in `tests/bilder/`, nicht im Repo) |
| Technik aus Pfad | `docs/technik-aus-pfad.md` |
| Fachliches Konzept | Claude Doc „SoMi-App – Konzept“: https://claude.ai/artifact/PgXX289nEGrioaSAxr1se8 |
| Übernahme aus Pfad | Claude Doc: https://claude.ai/artifact/1QVffW7b3J2oP6h2iNtkNZ |

## Stand

- Hauptversion 0.5.13 (Freigabe durch Nick am 16.11.2026) = Beta 0.5.13. Enthält alle SoMi-Punkte aus dem zweiten Prüfbericht (https://claude.ai/artifact/NKkgN5dbQKkFBthLEazS7t): Runde wird nach Neustart fortgesetzt, ein Zeitraum für Übersicht, Kürzel-Seite und PDF mit freiem Stichtag „Ab …“, Sperre leert die Ansicht, Namensliste wird bei Lesefehler nicht überschrieben.
- Entscheidungen (03.11.2026): nur für Nick; eigene Adresse n-bru.github.io/SoMi; App-Sperre standardmäßig an; Klassenarbeiten gehören dazu; Hausaufgaben als abschaltbares Kriterium; Notenskala 1 bis 6 mit + und −; Aufbewahrung 5 Jahre, Löschen nur nach Rückfrage; LE kann Noten bekommen.
- Kriterien: Mathe nach SILP Mathe 4.2/4.3 (Stand 09/2026), Sport nach SILP Sport Kap. 3 (Stand 03/2021, veraltet).

## Offene Punkte

1. **iPad-Test der Hauptversion 0.5.13** (Nick): Runde beenden und neu öffnen (wird fortgesetzt), Zeitraum „Ab …“, Sperre, Punkte eintragen bei Sichtschutz.
6. **Speichern bei sehr großem Bestand** (Prüfbericht 2, S14): nur beobachten. Wird das Tippen nach einem Schuljahr träge, archivierte Lerngruppen getrennt speichern.
7. **Design:** Vorschläge nach dem Vorbild der Claude-iPhone-App liegen als Seite mit Bildern vor (Link im Thread „SoMi und Pfad komplett prüfen“), Nick wählt aus.
2. **Hauptversion** nur auf Nicks Kommando (`python3 werkzeuge/hauptversion-freigeben.py somi-<version>`). Vorher eine Sicherung speichern.
3. **LE-Note im Zeugnis:** Nick prüft, ob eine Note auf Grundlage der Förderplanziele gekennzeichnet werden muss (AO-SF).
4. **Sport-Gewichtung** 5:1:2:2 ist ein Vorschlag, von Nick noch nicht bestätigt.
5. Aufbewahrungsfrist bleibt bei 5 Jahren nach VO-DV I; Nick fragt die DSB nicht (06.11.2026). Freigabe durch SL/DSB hält Nick nicht für nötig (03.11.2026).
