# SoMi – Regeln für die Arbeit mit Claude

SoMi ist Nicks persönliche Web-App für Noten und Beobachtungen in Mathe und Sport (Gesamtschule NRW, Kl. 5–10): Sonstige Mitarbeit, Klassenarbeiten, Arbeits- und Sozialverhalten, Rücklauf-Listen. Nur für den eigenen Unterricht, nicht für das Team.
Beta: https://n-bru.github.io/SoMi/beta/ · Hauptversion (später): https://n-bru.github.io/SoMi/

Lies zu Beginn jeder Sitzung `docs/uebergabe.md` und bei Fragen zu Funktionen `docs/funktionen.md`. Das fachliche Konzept steht im Claude Doc „SoMi-App – Konzept“ (Link in `docs/uebergabe.md`).
Weicht der Code von diesen Dateien ab, gilt der Code. Weise auf die Abweichung hin.

## Mit wem du arbeitest

- Nick ist Lehrkraft (Mathe, Sport) und Sonderpädagoge, kein Entwickler.
- Antworte auf Deutsch, knapp und direkt, ohne Fachjargon. Erkläre Schritte, die er selbst machen muss, einzeln.
- Sprich Schwächen in Wünschen oder Entwürfen offen an und begründe kurz.
- App-Texte: duzen, gendern mit Doppelpunkt, kurze Sätze, Dezimalkomma.

## Technik: gemeinsam mit Pfad

- Der Technik-Kern (Speichern, Sicherung, Verschlüsselung, App-Sperre, Dialoge, Design) ist aus Pfad (hbg-pfad/pfad, Stand 1.1.3) kopiert. Welche Bausteine das sind, steht in `docs/technik-aus-pfad.md`.
- Wird in Pfad ein Baustein aus dieser Liste korrigiert (vor allem Sicherheit), in SoMi nachziehen und die Liste aktualisieren.
- Details zu offenen Sicherheitsbefunden NICHT ins Repo schreiben. Das Repo ist öffentlich.

## Veröffentlichen: Beta zuerst

1. Jede Änderung an der App passiert in `quelle/somi.html`. Das ist die einzige Quelldatei.
2. Beta bauen: `python3 werkzeuge/beta-bauen.py somi-beta-<version>` und `beta/` plus `quelle/` committen.
3. Rauchtest: `node tests/rauchtest.js` (Playwright). Neue Funktionen dort ergänzen.
4. Nick prüft die Beta selbst auf dem iPad.
5. Die Hauptversion (`index.html`, `sw.js` im Hauptordner) wird NUR auf ausdrückliches Kommando von Nick aktualisiert: `python3 werkzeuge/hauptversion-freigeben.py somi-<version>`.
- Bei jeder Version `SOMI_VERSION` und `SOMI_STAND` anpassen.
- Speicher-Schlüssel nie umbenennen: Hauptversion `somi-v1`, Beta `somi-beta`. Sonst sind alte Daten unsichtbar.
- Caches getrennt lassen: Haupt-`sw.js` löscht keine `somi-beta*`-Caches, Beta-`sw.js` nur eigene.
- Eigene Adresse `n-bru.github.io/SoMi`, nie unter `hbg-pfad.github.io` (sonst gemeinsamer Browserspeicher mit Pfad).
- Arbeit über Pull Requests. Jede Änderung in `AENDERUNGEN.md` eintragen.

## Sicherheit im Code

- Kennungen in `onclick` und anderen Inline-Handlern IMMER über `${ja(...)}` einsetzen, nie roh.
- Fremddaten (Sicherungen) vor der Übernahme mit `okSus`, `okGroup`, `okSetting` und den übrigen `ok…`-Helfern prüfen. Für neue Datenarten neue `ok…`-Helfer schreiben. Text immer über `esc()` ausgeben.
- Content-Security-Policy erhalten, nicht aufweichen. Keine externen Abrufe: keine Webfonts, keine CDNs, kein Tracking.
- App-Sperre ist in SoMi der Normalfall (Einrichtungsschritt 1). Ausschalten nur mit Warnung.

## Datenschutz (feste Regeln)

- Daten nur lokal auf dem Dienstgerät. Kein Server, keine Cloud. OneDrive wird nicht genutzt und nicht erwähnt.
- Keine Namen, keine Initialen. Nur Kürzel `Klasse-Nummer` (z. B. `7B-01`) plus neutrales Symbol.
- Kein Förderschwerpunkt in der App, nur das Profil (Regel, Nachteilsausgleich, zieldifferent).
- Aufbewahrung 5 Jahre ab Ende des Kalenderjahres der Archivierung (VO-DV I § 9 Abs. 1, mit DSB zu bestätigen). SoMi löscht nie automatisch, nur nach Rückfrage.
- Keine echten Schülerdaten in Code, Repo, Tests oder Chat. Nur die fiktive Beispielklasse (`DEMO-…`).
- Keine eigene Spracheingabe, nur Verweis auf die Diktierfunktion der Tastatur.

## Gestaltung

- SoMi ist Nicks eigene App, NICHT im Sopäd-Team-Design. Eigene Farbe „Tafelgrün“: Akzent #2E6B57 (dunkel #7FC4A6), Grund #F5F6F1 (dunkel #14201B), Fläche #DCEDE4. Senfgelb (`--sig`) bleibt Signalfarbe.
- Logo: grünes Notenheft, kleines Etikett mit Haken links oben, dunkles Gummiband rechts, blasses Lesebändchen schaut unten heraus (`somi-logo.svg`, `LOGO` in `quelle/somi.html`, Icons daraus).
- Formen, Abstände und Bausteine wie Pfad-Design B.
- Systemschrift, Tippziele mind. 40 px, Schrift in Feldern mind. 16 px, eigene Dialoge statt `confirm`/`prompt`.
- Noten nie sichtbar, wenn das iPad am Beamer hängen könnte (Sichtschutz-Knopf ab Version 0.2).
- Keine Punkte, Abzeichen, Ranglisten, keine Strichlisten für Meldungen.

## Am Ende einer Sitzung

- `docs/uebergabe.md` aktualisieren.
