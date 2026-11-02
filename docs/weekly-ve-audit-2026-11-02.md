# V/E-Wochenlauf 2026-11-02

## Stand und Vorgehen
- Basis `main`: 498 Stationen (Stand 23.08.2026); komprimierte Datenbank und bestehende IDs gegen die Kandidaten geprüft.
- Offene PRs: #44 (Audit-Dokumentation, keine Datenkorrektur) und #45 (Ilsenburg `ve-417`, Laufzeit-Overlay).
- Dieser Branch baut **auf dem noch offenen PR #45** auf. Der PR soll deshalb gegen `data/weekly-ve-audit-2026-10-26` gestellt werden (Stacked PR); erst #45 prüfen/mergen, danach diesen PR nach `main` umbasieren oder GitHub-Retargeting kontrollieren. Kein automatischer Merge.

## Vorgeschlagene Datenkorrektur: ve-255, Caravan & Reisemobile Böhm, Elstra-Rauschwitz (Sachsen)
**Vorher:** Gelber Bestandseintrag mit `water=?`, nur pauschalem Bordatlas-Nachweis und ohne belegte Aussage zur Durchreise-Nutzung.

**Vorgeschlagen:** Im bereits durch #45 eingeführten `data/verified-corrections.json` einen Eintrag für die bestehende ID `ve-255` ergänzen (keine Dublette):
- Kassette/Grauwasser bleiben `ja`; Frischwasser wird `ja` mit deutlichem Hinweis auf die Geschäftszeiten.
- Die separate Durchreise-Entsorgung wird **als Aussage von Bordatlas** dokumentiert, nicht als Betreiberbestätigung.
- Wasserpreis **1 EUR/100 l laut Bordatlas**, Entsorgungspreis separat nicht ausgewiesen. Preis vor Ort prüfen.
- Koordinaten **51.196722, 14.134855** als Stellplatzposition (`site_approx`), nicht als eingemessener Entsorgungsschacht.
- Status/Farbe bleiben **Gelb**, da die Daten nicht frisch vor Ort oder vom Betreiber bestätigt wurden.

**Quellen, am 02.11.2026 online abgeglichen:**
1. Bordatlas, Einzelplatzprofil: https://www.bordatlas.de/stellplatz/3487-caravan-amp-reisemobile-boehm-elstra-rauschwitz/ – nennt Holiday Cleany, Kassette, Grauwasser, Wasser, Durchreisende, 1 EUR/100 l und GPS. **Letzte dokumentierte Vor-Ort-Prüfung: 03.08.2024.**
2. Stellplatzfuehrer.de: https://www.stellplatzfuehrer.de/plaetze/listen/alle/4963-caravan-und-reisemobile-bhm – unabhängiger Abgleich der Leistungen und Koordinaten, **letzte Eintragsänderung: 12.08.2023**.
3. Betreiber: https://www.caravanboehm.de/kontakt – bestätigt aktuelle Adresse und Öffnungszeiten Mo-Fr 09:00-18:00, nennt aber keine V/E-Leistungen.

**Unsicherheiten:** Die Betreiberwebsite bestätigt weder den aktuellen Betrieb der V/E-Anlage noch die reine Durchreise-Nutzung oder den Tarif. Die zwei Fach-/Communityquellen sind inhaltlich konsistent, ihre dokumentierten Ortsprüfungen jedoch älter. Keine grüne Freigabe ohne neueren Primärbeleg. `ve-257` (Friedenstraße, Elstra) ist ein anderer bestehender Standort und wird nicht verändert.

## Weitere geprüfte Hinweise – keine Datenänderung
- **Potsdam-Drewitz:** Nutzerhinweis vom 10.04.2026 über nicht mehr zugängliche Station: https://www.feliceontour.de/ver-und-entsorgung/ . Im produktiven 498er-Bestand existiert kein Eintrag mit „Drewitz“; daher keine Löschung. Der empfohlene Ersatz **Krongut Potsdam** ist als `ve-24` bereits vorhanden.
- **Waldcamp Seeblick, Märkische Heide:** Betreiber führt eine Kassettenentsorgung für 3 EUR auf: https://www.waldcampseeblick.de/ . Grauwasser und reine Durchreise-V/E nicht ausreichend belegt; keine neue Station.
- **Bannewitz Roll&Rest und Bad Elster ElsterCamping:** Aus dem Vorlauf weiterhin keine ausreichende Primärbestätigung für eigenständige V/E ohne Übernachtung; keine Aufnahme.
- **Saisonale Platzschließungen** wurden nicht als dauerhafte Stilllegung einer V/E-Station behandelt.
- In der gezielten öffentlichen Suche nach neuen, verlegten, geschlossenen und leistungsgeänderten Stationen in Berlin, Brandenburg, Mecklenburg-Vorpommern, Sachsen, Sachsen-Anhalt und Thüringen ergab sich kein weiterer ausreichend belastbarer Fall. Dies war keine Vor-Ort-Prüfung aller 498 Standorte.

## Review und Freigabe
- **Kein automatischer Merge.** Der vorgeschlagene Overlay-Eintrag wird erst wirksam, wenn #45 und danach dieser PR kontrolliert in `main` integriert werden.
- Die Zahl von 498 Stationen bleibt unverändert.
