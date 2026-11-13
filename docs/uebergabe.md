# Übergabe SoMi (Stand 13.11.2026)

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

- Hauptversion 0.5.4 (Freigabe durch Nick am 08.11.2026). Beta 0.5.11 (13.11.2026): alle 22 Punkte aus der Durchsicht vom 13.11. umgesetzt (Nick: „alles jetzt umsetzen“), in drei Schritten: 0.5.9 Fehler und Texte, 0.5.10 Speicher in IndexedDB, Zurücklegen statt Löschen, sicherere Sperre, 0.5.11 Oberfläche, Gruppen-PDF, Bildschirmtest. Prüfbericht: https://claude.ai/artifact/1eBjLmwdyAryhxuoWh3uJ1. Wichtig beim nächsten Freigeben der Hauptversion: Sie zieht die Daten einmal von localStorage nach IndexedDB um. Davor Beta 0.5.8 (12.11.2026): Sport-Runde erfasst Status und Kriterien auf einem Bildschirm (Nicks Wunsch). Davor Beta 0.5.6 (12.11.2026): Sport-Stundenstatus mit Knopf „Ohne Schulplaner“ (Nicks Wunsch; Standard dabei, zählt nicht zur Note, Spalte in der Übersicht, Zeile im PDF). Davor Beta 0.5.5 (08.11.2026): neue Startseite „Heute“ (eine Zeile pro Gruppe mit zwei Knöpfen, Zusatzinfo „ohne Eintrag“, Beispielgruppen ausgeblendet; Nick: max. 6 Gruppen gleichzeitig, passt ohne Scrollen aufs iPhone SE). Davor Beta 0.5.4 (08.11.2026): LE auf Wunsch wie alle anderen bewerten (Schalter je Fach). Davor 0.5.3: Förderplanziele für LE (Ziele statt Kriterien in der Runde, Textbausteine). Davor 0.5.2: PDF pro Kürzel. Davor 0.5.1: Noten eintragen als Vollbild, passt aufs iPhone SE. Davor 0.5.0: punktuelle Überprüfungen in Sport mit Gruppen (Riegen), Note zählt im gewählten Bereich. Davor 0.4.10: Schuljahreswechsel (Klasse versetzen, alte Lerngruppen gesammelt archivieren). Davor 0.4.9: Klassenlisten per Einfügen, Kurse daraus wählen (Nicks Wunsch). Echte Klassenlisten nie ins Repo, nur auf dem iPad einfügen. Lerngruppen bleiben bewusst nicht an Klassenlisten gebunden (freie Auswahl). Davor 0.4.8: Erfassen füllt genau den Bildschirm, nie scrollen. Davor 0.4.7: „Nur Rückmeldung“ entfernt. Davor 0.4.6: Runde als Matrix, Ankertexte per Fragezeichen, Sport-Kriterien nach SILP Sport (Motorik, Wissen, Sozial-, Arbeitsverhalten; 5:1:2:2). Davor 0.4.5: Erfassen kompakt, auf dem iPhone alles ohne Scrollen. Davor 0.4.4: Störung nur mit Pflicht-Notiz, Fachsprache unter Qualität. Davor 0.4.3: Runde pro Kind auf einem Bildschirm mit festen Kriterien (Qualität 2×, Beteiligung, Selbstständigkeit, Kooperation), Knopf massive Unterrichtsstörung, Präsentation/Heft/Übung gesondert, Rücklauf-Listen. Arbeits- und Sozialverhalten wieder entfernt (Nick 05.11.). Beta 0.3.4 (Technik aus Pfad 1.2.6) steckt darin und ist noch ungetestet. Verlauf in `AENDERUNGEN.md`.
- Entscheidungen (03.11.2026): nur für Nick; eigene Adresse n-bru.github.io/SoMi; App-Sperre standardmäßig an; Klassenarbeiten gehören dazu; Hausaufgaben als abschaltbares Kriterium; Notenskala 1 bis 6 mit + und −; Aufbewahrung 5 Jahre, Löschen nur nach Rückfrage; LE kann Noten bekommen.
- Kriterien: Mathe nach SILP Mathe 4.2/4.3 (Stand 09/2026), Sport nach SILP Sport Kap. 3 (Stand 03/2021, veraltet).

## Offene Punkte

1. **iPad-Test der Beta 0.5.11** (Nick): besonders Umzug der Daten, Sperre, Punkte eintragen mit Ziffernfeld, Einzeln bewerten.
2. **Hauptversion** nur auf Nicks Kommando (`python3 werkzeuge/hauptversion-freigeben.py somi-<version>`). Vorher eine Sicherung speichern.
3. **LE-Note im Zeugnis:** Nick prüft, ob eine Note auf Grundlage der Förderplanziele gekennzeichnet werden muss (AO-SF).
4. **Sport-Gewichtung** 5:1:2:2 ist ein Vorschlag, von Nick noch nicht bestätigt.
5. Aufbewahrungsfrist bleibt bei 5 Jahren nach VO-DV I; Nick fragt die DSB nicht (06.11.2026). Freigabe durch SL/DSB hält Nick nicht für nötig (03.11.2026).
