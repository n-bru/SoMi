# Technik aus Pfad

SoMi teilt sich die Technik mit Pfad (hbg-pfad/pfad). Es gibt keine gemeinsame Bibliothek: Die Bausteine sind aus `quelle/pfad.html` kopiert und angepasst. Wird ein Baustein in Pfad korrigiert, hier prüfen und nachziehen.

Stand der Kopie: Pfad 1.1.3 (26.10.2026).

| Baustein in Pfad | In SoMi | Anpassung |
|---|---|---|
| Content-Security-Policy | gleich | – |
| `load`, `save` mit verschlüsseltem Umschlag | gleich | Schlüssel `somi-v1`, Feld `somiEnc` |
| `esc`, `ja`, `okId`, `okDate`, `okStr`, `okNum` | gleich | neu: `okSus`, `okGroup`, `okSetting` für SoMi-Daten |
| `toast`, `undoToast`, `dlg`, `ask`, `askText` | gleich | `ask` mit Untertitel |
| `go`, `back`, `navTo`, `renderNav` | gleich | eigene Bereiche |
| `applyTheme`, Hell/Dunkel, Schriftgröße | gleich | – |
| `envHint`, Service Worker, `navigator.storage.persist` | vereinfacht | Einrichtungsseite mit Bildern noch nicht übernommen |
| Einrichtungsschritte (`SETUP`, `markFor`, `mk`, `mtip`) | angepasst | Schritte: App-Sperre, Beispielklasse, Sicherung |
| `pwKey`, `gcm`, `ungcm`, `idb*`, `askNewPw`, `backupKey`, `forgetBackupPw` | gleich | IndexedDB `somi` |
| `sealFile`, `openFile`, `exportJSON`, `backupTip`, `giveFile`, `download` | angepasst | Format `{somi:1}`, keine alten unverschlüsselten Formate |
| Zusammenführen beim Laden (neuere Fassung gewinnt, Löschungen gelten) | angepasst | `mergeList` pro Lerngruppe und Schüler:in |
| App-Sperre (`codeKey`, `tryCode`, `askCode`, `setLock`, `offLock`, `lockNow`, `renderLock`, `lockPress`, `lockForgot`, Fehlversuche) | gleich | in SoMi Standard an, Ausschalten mit Warnung |
| Symbole (`ICONS`, `freeIcon`, `pickIcon`) | gleich | frei pro Klasse statt global |
| Bauwege `beta-bauen.py`, `hauptversion-freigeben.py` | angepasst | Namen und Schlüssel |

Nicht übernommen: Teilen mit Kolleg:innen, Schulserver, Wochenziel, Verhalten mit Skalen, Tagebuch, Gesprächsblatt, Anleitung. Noch nicht übernommen, kommt später: eigene PDF-Erzeugung, CSV-Export, Stundenraster.
