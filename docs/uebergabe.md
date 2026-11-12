# Übergabe SoMi (Stand 12.11.2026)

## Wo was liegt

| Was | Wo |
|---|---|
| Quelldatei | `quelle/somi.html` |
| Beta | `beta/` (wird gebaut, nicht von Hand ändern) |
| Hauptversion | `index.html`, `sw.js`, `manifest.webmanifest`, Symbole |
| Bauwege | `werkzeuge/beta-bauen.py`, `werkzeuge/hauptversion-freigeben.py` |
| Rauchtest | `tests/rauchtest.js` |
| Technik aus Pfad | `docs/technik-aus-pfad.md` |
| Fachliches Konzept | Claude Doc „SoMi-App – Konzept“: https://claude.ai/artifact/PgXX289nEGrioaSAxr1se8 |
| Übernahme aus Pfad | Claude Doc: https://claude.ai/artifact/1QVffW7b3J2oP6h2iNtkNZ |

## Stand

- Hauptversion 0.5.4 (Freigabe durch Nick am 08.11.2026). Beta 0.5.6 (12.11.2026): Sport-Stundenstatus mit Knopf „Ohne Schulplaner“ (Nicks Wunsch; Standard dabei, zählt nicht zur Note, Spalte in der Übersicht, Zeile im PDF). Davor Beta 0.5.5 (08.11.2026): neue Startseite „Heute“ (eine Zeile pro Gruppe mit zwei Knöpfen, Zusatzinfo „ohne Eintrag“, Beispielgruppen ausgeblendet; Nick: max. 6 Gruppen gleichzeitig, passt ohne Scrollen aufs iPhone SE). Davor Beta 0.5.4 (08.11.2026): LE auf Wunsch wie alle anderen bewerten (Schalter je Fach). Davor 0.5.3: Förderplanziele für LE (Ziele statt Kriterien in der Runde, Textbausteine). Davor 0.5.2: PDF pro Kürzel. Davor 0.5.1: Noten eintragen als Vollbild, passt aufs iPhone SE. Davor 0.5.0: punktuelle Überprüfungen in Sport mit Gruppen (Riegen), Note zählt im gewählten Bereich. Davor 0.4.10: Schuljahreswechsel (Klasse versetzen, alte Lerngruppen gesammelt archivieren). Davor 0.4.9: Klassenlisten per Einfügen, Kurse daraus wählen (Nicks Wunsch). Echte Klassenlisten nie ins Repo, nur auf dem iPad einfügen. Lerngruppen bleiben bewusst nicht an Klassenlisten gebunden (freie Auswahl). Davor 0.4.8: Erfassen füllt genau den Bildschirm, nie scrollen. Davor 0.4.7: „Nur Rückmeldung“ entfernt. Davor 0.4.6: Runde als Matrix, Ankertexte per Fragezeichen, Sport-Kriterien nach SILP Sport (Motorik, Wissen, Sozial-, Arbeitsverhalten; 5:1:2:2). Davor 0.4.5: Erfassen kompakt, auf dem iPhone alles ohne Scrollen. Davor 0.4.4: Störung nur mit Pflicht-Notiz, Fachsprache unter Qualität. Davor 0.4.3: Runde pro Kind auf einem Bildschirm mit festen Kriterien (Qualität 2×, Beteiligung, Selbstständigkeit, Kooperation), Knopf massive Unterrichtsstörung, Präsentation/Heft/Übung gesondert, Rücklauf-Listen. Arbeits- und Sozialverhalten wieder entfernt (Nick 05.11.). Beta 0.3.4 (Technik aus Pfad 1.2.6) steckt darin und ist noch ungetestet. Verlauf in `AENDERUNGEN.md`.
- Entscheidungen (03.11.2026): nur für Nick; eigene Adresse n-bru.github.io/SoMi; App-Sperre standardmäßig an; Klassenarbeiten gehören dazu; Hausaufgaben als abschaltbares Kriterium; Notenskala 1 bis 6 mit + und −; Aufbewahrung 5 Jahre, Löschen nur nach Rückfrage; LE kann Noten bekommen.
- Kriterien: Mathe nach SILP Mathe 4.2/4.3 (Stand 09/2026), Sport nach SILP Sport Kap. 3 (Stand 03/2021, veraltet).

## Offene Punkte

1. **GitHub Pages einschalten** (Nick): Repo-Einstellungen → Pages → Branch `main`, Ordner `/`. Erst dann ist die Beta erreichbar.
2. **Version 0.3.3 als Beta und Hauptversion** (Freigabe durch Nick am 05.11.2026; 0.3.3: schriftliche Überprüfungen auch in Sport, Anteil schriftlich je Fach einstellbar; 0.3.2: Inhalt auf dem iPhone tiefer wegen iOS-Unschärfe-Streifen oben; enthält 0.3.0 Klassenarbeiten; 0.3.1: Knopf „teilweise“, Stufenknöpfe niedriger). 0.2.9 entfernt den SL/DSB-Hinweis. 0.2.8: Knöpfe zeigen Notenwert, Vorschlag erst ab 3 Beobachtungen in 2 Kriterien (Nicks Entscheidung). 0.2.7: Notenvorschlag erst je Kriterium, dann gewichtet über die Kriterien (Gewicht 1×/2×/3×, Nicks Entscheidung 04.11.). Stufenknöpfe: übertroffen / erfüllt / teilweise / kaum erfüllt mit Notenwert darunter (Nicks Wahl 04.11.). o bleibt 3,5. Davor 0.2.4: Beobachtungen 4-stufig mit Notenvorschlag (Nicks Wunsch 04.11.). 0.2.3: Namensliste (getrennt, verschlüsselt, nur mit Sperre; Nicks Entscheidung 04.11.). Davor 0.2.2 (03.11.2026): Mathe Sonstige Mitarbeit mit „Ganze Klasse nacheinander“ (Kriterien vorab wählen, überspringen, nicht anwesend) und „Einzeln bewerten“; Sport-Stundenstatus.
3. **Version 0.3.0 als Beta** (04.11.2026): Klassenarbeiten (Punkte, Schlüssel SILP 4.3, NA-Vermerk, eigene Höchstpunktzahl zieldifferent, Notenspiegel) und Gesamtvorschlag 40/60. Tendenz +/− in Dritteln: Nicks Entscheidung (05.11.). 0.3.3: schriftliche Überprüfungen auch in Sport, Anteil schriftlich je Fach einstellbar. Nicht drin: Punkte je Aufgabe, Ordnungspunkte. Wartet auf Nicks Prüfung auf dem iPad.
4. **Version 0.4:** Beta 0.4.0 Arbeits- und Sozialverhalten (05.11.2026, Skala + / ○ / −, zählt nicht zur Note). Beta 0.4.1 Rücklauf-Listen (05.11.2026, Nick wollte beides in 0.4).
5. **Version 0.5** (Nicks Auswahl 06.11.2026): 0.5.0 punktuelle Überprüfungen Sport mit Gruppen (fertig, Beta). 0.5.1 Eintragen passt aufs SE. 0.5.2 PDF pro Kürzel, 0.5.3 LE-Förderplanziele (fertig). Offen: Nick prüft, ob eine Note auf Grundlage der Förderplanziele im Zeugnis gekennzeichnet werden muss (AO-SF); Textbausteine sind ein Vorschlag (2–4 Ziele als Kriterien, Textbausteine fürs Zeugnis). Entfallen: Messwerte, außerunterrichtliches Engagement, Stundenplan.
6. **Aufbewahrungsfrist:** Nick fragt die DSB nicht (06.11.2026). Bleibt bei 5 Jahren nach VO-DV I.
7. **Freigabe** durch Schulleitung und DSB: Nick hält sie nicht für nötig (03.11.2026). Die App weist in den Einstellungen weiter darauf hin.
