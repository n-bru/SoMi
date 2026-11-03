# SoMi – Funktionen (Version 0.2.2, Stand 03.11.2026)

Quelldatei: `quelle/somi.html`. Eine einzelne Datei, offline im Browser, für iPad, Handy und PC.

## Bereiche
- **Heute:** „Schnell erfassen“ für jede aktive Mathe-Gruppe, Zähler (aktive Lerngruppen, Schüler:innen, Archiv), Einrichtung, Sicherungs-Erinnerung (nach 3 Tagen), Hinweis auf abgelaufene Aufbewahrungsfristen, Liste der aktiven Lerngruppen.
- **Lerngruppen:** anlegen mit Fach (Mathe, Sport), Klasse und Kurs (ohne, E, G). Archiv eingeklappt.
- **Lerngruppe:** Schüler:innen per Kürzel hinzufügen (Vorschlag: nächste freie Nummer, z. B. 7B-03), aus anderen Gruppen derselben Klasse übernehmen, archivieren, wieder aktivieren, löschen (nur archiviert, vor Fristende mit doppelter Rückfrage).
- **Schüler:in:** Symbol, Profil (Regel, Nachteilsausgleich mit Freitext, zieldifferent mit Schalter „Note im Zeugnis“), aus der Gruppe entfernen mit Rückgängig.
- **Einstellungen:** Erscheinungsbild, Schriftgröße, App-Sperre, Sicherung speichern und laden, Beispielklasse, Aufbewahrung, Datenschutz.

## Sonstige Mitarbeit Mathe (ab 0.2)
- **Erfassen:** Kriterium wählen (SILP Mathe 4.2: Qualität der Beiträge, Kontinuität, Selbstständigkeit, Kooperation, Fachsprache, Werkzeuge, Präsentation, Portfolio/Heft, Schriftliche Übung; Hausaufgaben/LZ-Aufgaben nur, wenn in den Einstellungen eingeschaltet). Ankertexte „gut“ und „ausreichend“ aufklappbar. Ein oder mehrere Kürzel antippen, dann Note tippen (1+ bis 6). Die Notentasten bleiben beim Scrollen unten sichtbar. Optional Stichwort, Datum (auch nachträglich), Schalter „nur Rückmeldung“ (zählt nicht). Die App merkt sich das letzte Kriterium pro Gruppe. Haken auf dem Kürzel: heute schon in diesem Kriterium erfasst. Rückgängig über den Hinweis.
- **Übersicht pro Lerngruppe:** Halbjahr (ab 1.8. bzw. 1.2.), Schuljahr oder alles. Pro Kürzel: Zahl der zählenden Noten (+ Rückmeldungen), Durchschnitt, Verlauf der letzten 6 Noten, letzter Eintrag; rot, wenn seit 2 Wochen kein Eintrag.
- **Kürzel-Seite:** alle Einträge der Gruppe mit Datum, Kriterium, Note und Stichwort; Durchschnitt je Kriterium; „zählt“/„zählt nicht“ umschalten; löschen mit Rückgängig.
- **Sichtschutz:** Noten sind nach jedem Start verborgen (●●). „Noten zeigen“ blendet sie ein, bis du sie wieder verbirgst oder SoMi neu startest. Beim Erfassen nennt der Hinweis die Note nur, wenn Noten gezeigt werden.
- **Hinweis „Seit 2 Wochen ohne Eintrag“** beim Erfassen.
- Sport: Noten kommen in Version 0.5.

### Zwei Wege zum Erfassen (ab 0.2.1, Runde ab 0.2.2)
- **Ganze Klasse nacheinander:** Zuerst „Was hast du heute beobachtet?“: ein oder mehrere Kriterien antippen (die letzte Auswahl ist vorbelegt), dann „Runde starten“. Die App zeigt ein Kürzel nach dem anderen und fragt bei jedem die gewählten Kriterien nacheinander ab. Note tippen speichert und springt weiter.
  - „überspringen“: für dieses Kriterium nichts speichern (da, aber nichts beobachtet).
  - „nicht anwesend“: das ganze Kürzel überspringen, nichts speichern.
  - „‹ Zurück“ geht einen Schritt zurück; eine neue Note ersetzt die aus dieser Runde. „Kriterien ändern“ führt zurück zur Auswahl.
- **Einzeln bewerten:** Kürzel-Kacheln antippen (auch mehrere), dann Note. Wie in 0.2.0.

## Sport: Stundenstatus (ab 0.2.2)
- Runde durch die Gruppe: aktiv, ohne Sportsachen, sportunfähig, nicht anwesend. „Alle übrigen: aktiv“ füllt den Rest. Pro Tag ein Status je Kürzel; erneutes Tippen ersetzt ihn.
- Übersicht pro Halbjahr/Schuljahr: Anzahl je Status, ab 3 markiert.
- Daten: `db.att = [{id,gid,sid,d,st,upd}]`, geprüft mit `okAtt`, in Sicherung und Import enthalten.

## Einrichtung
Drei Schritte: Code für die App-Sperre, fiktive Beispielklasse, erste Sicherung.

## Kürzel
Nur Buchstaben, Ziffern, Binde- und Unterstrich, 2 bis 20 Zeichen, mit mindestens einer Ziffer. Namen werden abgelehnt. Ein Kürzel gilt für alle Lerngruppen (z. B. Mathe und Sport), das Profil auch.

## Aufbewahrung
Archivierte Lerngruppen bleiben 5 Jahre ab Ende des Kalenderjahres der Archivierung. Danach erscheint auf „Heute“ ein Hinweis. Gelöscht wird nur nach Bestätigung.

## Sicherung
Verschlüsselt (AES-256-GCM, PBKDF2 310.000 Runden). Passwort einmal festlegen, auf Wunsch auf dem Gerät merken. Laden ergänzt: Neues kommt dazu, bei gleichen Einträgen gilt die neuere Fassung, Löschungen gelten. Die Beispielklasse ist nicht in der Sicherung.

## App-Sperre
4 bis 6 Ziffern, Daten im Browserspeicher dann verschlüsselt (PBKDF2 600.000 Runden). Sperren sofort, nach 1 oder 5 Minuten im Hintergrund. Nach 5 Fehlversuchen Wartezeit. Code vergessen: alles löschen, Sicherung laden.
