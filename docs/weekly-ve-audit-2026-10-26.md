# V/E-Wochenlauf 2026-10-26

## Repository-Stand und Ergebnis

Produktive Datenbank `main`: v4.2 mit 498 Stationen, Basisstand 2026-08-23. Offener PR #44 vom 2026-09-28 enthält nur Audit-Dokumentation, keine Stationsdaten. Der am 2026-10-19 angelegte Branch enthält eine nicht produktiv eingebundene Korrekturdatei. Dieser PR führt die bestehende Station ve-417 als echte Laufzeitkorrektur über einen JSON-Overlay-Ladevorgang ein. **Keine neue Station, kein automatischer Merge.**

## Datenkorrektur: ve-417, Wanderlust im Ilsetal, Ilsenburg

- **Änderung:** Kassette/Grauwasser/Frischwasser auf `ja`, Durchreise-V/E laut Fachquelle 5 EUR, Wasser 2 EUR/100 l; Standortkoordinaten 51.85472 / 10.67111 (Stellplatz, nicht V/E-Punkt). Adresse des Stellplatzes **Ilsetal 6**, während Ilsetal 16a laut Betreiber den Outdoor-Shop/Ferienwohnung bezeichnet.
- **Begründung:** Vorhandener gelber Datensatz enthielt ungenaue Position und ungeklärte Leistungen. Es darf kein doppelter Datensatz erzeugt werden.
- **Fachquelle, am 26.10.2026 geprüft:** https://www.promobil.de/stellplatz/stellplatz-wanderlust-im-ilsetal-588f1d3b721d54a52815ce5e.html
- **Betreiber, indexierte Standortangaben:** https://www.wanderlust-ilsetal.de/ilsenburg-und-umgebung/
- **Community, Serviceangaben und aktuelle Bewertungen:** https://park4night.com/en/place/49589
- **Unsicherheit:** Die Betreiber-Website zeigte bei direktem Aufruf am 26.10.2026 eine Wartungsseite. Betreiber bestätigt den **Durchreisetarif** daher aktuell nicht selbst. Community nennt teils abweichende Wasserpreise. Farbe bleibt **Gelb**; Preis ausdrücklich mit Vor-Ort-Vorbehalt. Koordinaten sind nicht auf den Entsorgungsschacht eingemessen.

## Weitere Kandidaten – ausdrücklich nicht freigegeben

- **Bannewitz, Roll&Rest (Sachsen):** Neuer Platz seit März 2026 mit CamperClean, Wasser und Entsorgung. Für reine V/E ohne Stellplatzbuchung ist kein belastbarer Zugangsnachweis verfügbar; Smartcard-Zugang kann an Check-in gebunden sein. Kein neuer Datensatz. Quellen: https://park4night.com/de/place/666108 und https://www.camping.info/en/campsite/rollrest
- **Bad Elster, ElsterCamping (Sachsen):** Im August 2026 eröffnet; Wasser und Grauwasser belegt, aber Kassettenentsorgung und unabhängige Durchreise-V/E nicht vollständig bestätigt. Kein neuer Datensatz. Quellen: https://www.mdr.de/nachrichten/sachsen/chemnitz/vogtland/news-bad-elster-camping%2Cneuer-wohnmobilstellplatz-100.html und https://www.promobil.de/stellplatz/elstercamping-6a7995ffca4e210008b93181.html
- **Reichenbach/Mylau, Göltzschtalbrücke (Sachsen):** Bisher nur Bebauungsplan-Vorentwurf (Stand 12.08.2026, Beteiligung bis 23.10.2026), kein eröffneter Platz. Quelle: https://buergerbeteiligung.sachsen.de/portal/reichenbach-vogtland/beteiligung/themen/1068719
- **Bad Sulza, Ilsenburg, Bergwitzsee:** Bereits vorhandene Datensätze ve-462, ve-417, ve-352; die im PR #44 als Ergänzungen bezeichneten Kandidaten dürfen nicht dupliziert werden.

## Implementierung und Review

`data/verified-corrections.json` wird beim Laden der komprimierten 498er Datenbank eingelesen und per `id` auf bestehende Datensätze angewandt. Fehler beim Abruf verhindern nicht das Laden des bisherigen Bestands; fehlende IDs werden in der Browser-Konsole gemeldet. Die Änderung ist nur ein Vorschlag, bis der PR manuell geprüft und gemergt wurde.
