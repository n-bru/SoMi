# SoMi – Funktionen (Version 0.4.6, Stand 05.11.2026)

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
- **Ganze Klasse nacheinander:** Zuerst „Was hast du heute beobachtet?“: ein oder mehrere Kriterien antippen (die letzte Auswahl ist vorbelegt), dann „Runde starten“. Ab 0.4.2 zeigt die App pro Kürzel alles auf einem Bildschirm: jedes gewählte Kriterium mit seinen vier Stufen, darunter immer Arbeitsverhalten und Sozialverhalten (+ / ○ / −). Dann „Weiter ›“.
  - Tippen speichert sofort; eine andere Stufe ersetzt sie, nochmal tippen nimmt sie zurück. Nicht Beobachtetes leer lassen.
  - „nicht anwesend“: das ganze Kürzel überspringen, Getipptes wird entfernt.
  - „‹ Zurück“ zeigt das vorige Kürzel mit seiner Auswahl. „Kriterien ändern“ führt zurück zur Auswahl.
  - Stichwort: gilt für alles, was du danach bei diesem Kind tippst; bei „Weiter“ auch für vorher Getipptes ohne Stichwort.
- **Einzeln bewerten:** Kürzel-Kacheln antippen (auch mehrere), dann Note. Wie in 0.2.0.

## Sport: Stundenstatus (ab 0.2.2)
- Runde durch die Gruppe: aktiv, ohne Sportsachen, sportunfähig, nicht anwesend. „Alle übrigen: aktiv“ füllt den Rest. Pro Tag ein Status je Kürzel; erneutes Tippen ersetzt ihn.
- Übersicht pro Halbjahr/Schuljahr: Anzahl je Status, ab 3 markiert.
- Daten: `db.att = [{id,gid,sid,d,st,upd}]`, geprüft mit `okAtt`, in Sicherung und Import enthalten.

## Stufen und Notenvorschlag (ab 0.2.4)
- Beobachtungen in 4 Stufen: ++ übertroffen, + erfüllt (SILP-Anker „gut“), o teilweise, − kaum erfüllt (Anker „ausreichend“ nicht erreicht); unter jedem Knopf klein der Notenwert. Notenvorschlag erst ab 3 zählenden Beobachtungen in mind. 2 Kriterien. Notenvorschlag: Mittel je Kriterium, dann gewichtet (1×–3×, Einstellungen). Gespeichert als `o.s` ("4" bis "1"); alte Einträge mit Note `o.n` bleiben gültig.
- Umrechnung: jede Stufe hat einen Notenwert (Standard 1 / 2 / 3,5 / 5, Einstellungen → „Umrechnung Stufen → Note“, gespeichert als `db.stw`). Der Mittelwert der zählenden Einträge wird auf Drittel gerundet: 2,33 → 2−, 2,67 → 3+; genau in der Mitte zugunsten der Schüler:innen.
- Übersicht und Kürzel-Seite zeigen den Notenvorschlag, verborgen durch den Sichtschutz.

## Klassenarbeiten Mathe (ab 0.3)
- In der Lerngruppe „Klassenarbeiten“: anlegen mit Titel, Datum, Höchstpunktzahl und Notenschlüssel (vorbelegt nach Kurs der Gruppe, pro Arbeit änderbar).
- Punkte eintragen Kürzel für Kürzel: Zahl tippen, Enter oder „Speichern und weiter“. Halbe Punkte mit Komma. „nicht mitgeschrieben“ und „schreibt nach“ statt Punkten. Tippen auf eine Zeile der Tabelle springt zu diesem Kürzel.
- Notenschlüssel nach SILP Mathe 4.3 (Mindestprozent für 1 bis 5): ohne Kurs 85/70/55/40/20, E- und G-Kurs 87/73/59/45/18. Mindestpunkte auf halbe Punkte gerundet. Tendenz + und −: jede Note in drei gleich große Punktbereiche geteilt (nicht im SILP; abschaltbar unter Einstellungen → Klassenarbeiten, `db.kaTend`).
- Profil Nachteilsausgleich: Schalter „gewährt“ plus kurzer Vermerk je Arbeit. Profil zieldifferent: eigene Höchstpunktzahl je Kürzel (angepasste Arbeit), gleicher Prozentschlüssel.
- Notenspiegel (ganze Noten) und Schnitt, verborgen durch den Sichtschutz, ebenso Punkte und Noten in der Tabelle.
- Ab 0.3.3 auch in Sport als „Schriftliche Überprüfungen“ (ohne Gesamtvorschlag bis Version 0.5).
- Gesamtvorschlag: Anteil schriftlich je Fach einstellbar (`db.kaw`, 20 bis 70 %, Standard Mathe 60 % nach SILP, Sport 20 %), Rest Sonstige Mitarbeit. Mit + und −, ins Zeugnis kommt eine ganze Note. Erscheint in der Übersicht (Spalten SoMi, KA, Gesamt, sobald es im Zeitraum eine Arbeit gibt) und auf der Kürzel-Seite. Nur wenn beides vorliegt.
- Daten: `db.ka = [{id,gid,t,d,max,sk,r:{sid:{p,st,mx,na,nat}},upd}]`, geprüft mit `okKa`, in Sicherung und Import enthalten. Die Beispielklasse hat eine fiktive Arbeit.

## Sport: Sonstige Leistungen (ab 0.4.6)
- Kriterien nach SILP Sport Kap. 3 (Stand 03/2021): Motorik, Wissen, Sozialverhalten, Arbeitsverhalten. Ankertexte angelehnt, nicht wörtlich.
- Gewicht-Vorschlag 5 : 1 : 2 : 2 (= 50/10/20/20 %), in Einstellungen 1× bis 5× änderbar.
- Erfassen mit Umschalter Status / Ganze Klasse / Einzeln. Übersicht Sonstige Leistungen und Übersicht Stundenstatus getrennt.

## Erfassen auf dem iPhone (ab 0.4.5, Matrix ab 0.4.6)
- Runde als Matrix: oben einmal die Stufen, links die Kriterien, Knöpfe zeigen den Notenwert. Fragezeichen am Kriterium öffnet Hinweis und Ankertexte.
- Runde und Stundenstatus passen ohne Scrollen auf ein iPhone (Safari, 390 × 664). Kopf in einer Zeile, Menüleiste unten beim Erfassen aus (zurück über ‹).
- In der Runde keine Hinweise und Ankertexte. Die stehen weiter bei „Einzeln bewerten“. Stichwort, „Nur Rückmeldung“ und Datum stehen unter den Knöpfen.

## Kriterien und Runde (ab 0.4.3)
- Runde „Ganze Klasse nacheinander“ ohne Kriterienwahl: pro Kürzel immer Qualität der Beiträge, Beteiligung (SILP: Kontinuität), Selbstständigkeit, Kooperation; dazu Werkzeuge und Hausaufgaben, wenn unter Einstellungen eingeschaltet (`db.werkz`, `db.hausa`). Darunter der Knopf „massive Unterrichtsstörung“. Dann „Weiter ›“.
- Fachsprache und Kontinuität als eigene Kriterien entfallen bzw. heißen jetzt „Beteiligung“; alte Einträge zählen weiter. Fachsprache gehört ab 0.4.4 zur Qualität (Hinweis und Anker). „Werkzeuge“ (SILP: Geodreieck, Zirkel, Taschenrechner, GeoGebra, Tabellenkalkulation) ist zuschaltbar.
- Gewicht: Qualität standardmäßig 2× (`KGW0`), alles andere 1×, unter Einstellungen änderbar.

## Präsentation, Heft, Übung (ab 0.4.3)
- In der Mathe-Lerngruppe „Präsentation, Heft, Übung“: anlegen wie eine Klassenarbeit, Art Präsentation, Portfolio/Heft oder Schriftliche Übung.
- Präsentation, Portfolio/Heft: je Kürzel direkt eine Note (1+ bis 6), „fehlt“, „holt nach“. Schriftliche Übung: Punkte mit Notenschlüssel wie Klassenarbeiten.
- Zählen zur Sonstigen Mitarbeit als ihr Kriterium (Gewicht unter Einstellungen), nicht zu den Klassenarbeiten. Erscheinen in Übersicht und Kürzel-Seite als „gesondert“.
- Daten: in `db.ka` mit Feld `k` (praes, port, sue); bei praes/port ohne `max`/`sk`, Ergebnis `r[sid].n`. Geprüft mit `okKa`.

## Massive Unterrichtsstörungen (ab 0.4.3)
- Knopf in der Runde (Mathe), beim Einzeln-Bewerten und im Stundenstatus (Sport). Notiz ist Pflicht (ab 0.4.4): Der Knopf fragt „Was ist passiert?“, ohne Text wird nichts gespeichert. Zählt nicht zur Note.
- Spalte „Stör.“ in den Übersichten, Liste auf der Kürzel-Seite (löschen mit Rückgängig), verborgen durch den Sichtschutz.
- Daten: `db.asv` mit `m:"stoer"`, `v:"-"`. Einträge zu Arbeits-/Sozialverhalten aus 0.4.0–0.4.2 bleiben lesbar und löschbar.

## Rücklauf-Listen (ab 0.4.1)
- In der Lerngruppe „Rückläufe“: Liste anlegen mit Titel, Art (Unterschrift, Geld, Formular), Betrag pro Kind (nur Geld), ausgegeben am, fällig bis (freiwillig).
- Je Kürzel „erledigt“ antippen; nochmal tippen macht es wieder offen. Bei Geld „Teilbetrag“: gezahlter Betrag, die App zeigt, was fehlt.
- Oben: wer noch fehlt; bei Geld eingesammelt, Soll, Fehlbetrag. Es zählen die aktuellen Mitglieder der Gruppe.
- „Liste abschließen“: nur lesbar, unter „Abgeschlossen“; „Wieder öffnen“ geht. Löschen mit Rückgängig.
- „Heute“ zeigt offene Listen; nach dem Fälligkeitsdatum rot. Keine Erinnerungen an Eltern.
- Daten: `db.rl = [{id,gid,t,art,aus,bis,ct,r:{sid:{st,pc}},arch,upd}]` (Beträge in Cent), geprüft mit `okRl`, in Sicherung und Import enthalten.

## Namensliste (ab 0.2.3)
- In der Lerngruppe „Namen eintragen“: zu jedem Kürzel ein Name. Geht nur mit App-Sperre.
- Gespeichert getrennt von den Noten (eigener Speicherplatz `somi-v1-namen` bzw. `somi-beta-namen`), verschlüsselt mit dem Schlüssel der App-Sperre. Nach dem Entsperren sichtbar.
- Anzeige klein unter dem Kürzel (Kacheln, Runde, Übersicht, Lerngruppe, Kürzel-Seite). „Namen verbergen“ blendet sie für diese Sitzung aus.
- Nicht in der normalen Sicherung. Eigene Datei unter Einstellungen → „Namensliste sichern“ (gleiches Passwort, Namen der Beispielklasse nicht dabei). Laden über „Namensliste laden“; übernimmt nur Namen zu vorhandenen Kürzeln.
- App-Sperre ausschalten, „Code vergessen“ oder „Alles löschen“ löscht die Namen.

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
