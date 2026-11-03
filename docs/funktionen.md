# SoMi – Funktionen (Version 0.1.1, Stand 03.11.2026)

Quelldatei: `quelle/somi.html`. Eine einzelne Datei, offline im Browser, für iPad, Handy und PC.

## Bereiche
- **Heute:** Zähler (aktive Lerngruppen, Schüler:innen, Archiv), Einrichtung, Sicherungs-Erinnerung (nach 3 Tagen), Hinweis auf abgelaufene Aufbewahrungsfristen, Liste der aktiven Lerngruppen.
- **Lerngruppen:** anlegen mit Fach (Mathe, Sport), Klasse und Kurs (ohne, E, G). Archiv eingeklappt.
- **Lerngruppe:** Schüler:innen per Kürzel hinzufügen (Vorschlag: nächste freie Nummer, z. B. 7B-03), aus anderen Gruppen derselben Klasse übernehmen, archivieren, wieder aktivieren, löschen (nur archiviert, vor Fristende mit doppelter Rückfrage).
- **Schüler:in:** Symbol, Profil (Regel, Nachteilsausgleich mit Freitext, zieldifferent mit Schalter „Note im Zeugnis“), aus der Gruppe entfernen mit Rückgängig.
- **Einstellungen:** Erscheinungsbild, Schriftgröße, App-Sperre, Sicherung speichern und laden, Beispielklasse, Aufbewahrung, Datenschutz.

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
