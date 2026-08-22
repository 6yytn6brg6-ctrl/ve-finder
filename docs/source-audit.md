# V/E Finder – Quellen-Audit

Stand: 2026-08-22

## Ziel

Die Stationsdaten sollen nicht von einer einzelnen Plattform abhängen. Jede Station soll möglichst durch mindestens eine offene oder offizielle Quelle belegbar sein; bei wichtigen Angaben wie öffentliche Zugänglichkeit, Grauwasser, Kassette, Frischwasser und Gebühren sind zwei voneinander unabhängige Hinweise ideal.

## Aktueller Stand im Repository

- Der produktive Bestand umfasst 466 Stationen und wird als gzip-komprimierte, Base64-geteilte JSON-Datei geladen.
- Seit v3.2 besitzt der V/E Finder ein strukturiertes Quellenmodell pro Station: `sources[]`, `checked_at`, `source_type`, `source_url`, `source_note` und `verification_status`.
- Altstationen werden nicht automatisch als neu geprüft ausgegeben. Alte freie Quellenangaben werden in das neue Modell gespiegelt und zunächst als `legacy_untracked` geführt, bis eine belastbare Einzelprüfung erfolgt.
- Neue bzw. neu geprüfte Stationen sollen zusätzlich `confirms[]`, `discovered_via`, `source_owner_country` und `source_dependency` erhalten, damit auch die Unabhängigkeit mehrerer Quellen nachvollziehbar bleibt.

## Bewertungsstufen

- `legacy_untracked` – Altbestand, Einzelquelle noch nicht sauber dokumentiert/geprüft
- `candidate` – Fundstelle vorhanden, Primärbestätigung fehlt
- `primary_confirmed` – mindestens eine belastbare Primärquelle bestätigt den Eintrag
- `cross_checked` – mindestens zwei wirklich unabhängige Quellen stimmen überein
- `conflict` – Quellen widersprechen sich
- `temporarily_limited` – Station vorhanden, aktuell ganz oder teilweise eingeschränkt

## Primär- und Grundquellen

| Quelle / Klasse | Herkunft | Rolle | Status / Regel |
|---|---|---|---|
| Kommunen / Stadtverwaltungen | Deutschland | Primärbestätigung | höchste Priorität bei öffentlichen Stellplätzen, Parkplätzen und V/E-Anlagen |
| Tourismusverbände / Tourist-Informationen | Deutschland | Primärbestätigung / Neufund | häufig aktuelle kommunale Angaben |
| Betreiber / Stellplatz-Webseiten | Deutschland / international | Primärbestätigung | Zugang, Preise, Öffnungszeiten, Leistungen |
| Stadtwerke / Kläranlagen | Deutschland | Primärbestätigung | besonders wichtig für reine Durchreise-V/E |
| Hersteller / Betreiber von V/E-Anlagen (CamperClean, SANI-STATION u. a.) | Deutschland / international | Hersteller-/Referenzquelle | Standortlisten und Anlagenbetrieb verifizieren |
| Caravan-/Wohnmobilhändler | Deutschland | Betreiberquelle | Händler-V/E und Frischwasserangebote prüfen |
| Tankstellen / Autohöfe / Raststätten | Deutschland | Betreiberquelle | einzelne öffentliche Durchreise-V/E |
| Marinas / Häfen | Deutschland | Betreiberquelle | nur übernehmen, wenn Wohnmobilzugang tatsächlich möglich |
| OpenStreetMap / Overpass | international / offen | Grund- und Vergleichsquelle | Audit läuft; `amenity=sanitary_dump_station`, `sanitary_dump_station=yes/public/customers`; ODbL beachten |
| Google Maps | international | Plausibilitäts-/Entdeckungsquelle | keine automatische Übernahme; Primärquelle bevorzugen |

## Wohnmobil- und Communityquellen – Deutschland / DACH

| Quelle | Herkunft | Rolle | Auditstatus |
|---|---|---|---|
| AlpacaCamping | Deutschland | Lücken-/Kontrollquelle | systematischer Abgleich offen |
| BORDATLAS / Reisemobil International | Deutschland | Lücken-/Kontrollquelle | systematischer Abgleich offen; keine pauschale Datenbankübernahme |
| promobil | Deutschland | Lücken-/Kontrollquelle | systematischer Abgleich offen |
| stellplatz.info | DACH | Lücken-/Kontrollquelle | systematischer Abgleich offen |
| PiNCAMP | Deutschland | Camping-/Kontrollquelle | Durchreise-V/E gesondert prüfen |
| FREEONTOUR | Deutschland | Lücken-/Kontrollquelle | systematischer Abgleich offen |
| VanSite | Deutschland | Betreiber-/Stellplatzquelle | Zugang/Service einzeln prüfen |
| StayFree | europaweit | Community-/Kontrollquelle | systematischer Abgleich offen |
| Camping.info | DACH / europaweit | Camping-/Kontrollquelle | öffentliche Durchreise-Nutzung gesondert verifizieren |
| iOverlander | international | Community-/Kontrollquelle | Community-Angaben nicht allein bestätigen |
| Öffentliche Facebook-/Instagram-Beiträge | international | Entdeckungs-/Störungsquelle | nie ungeprüft importieren; Betreiber, Kommune oder redaktionelle Fachquelle gegenprüfen |

## Internationale Quellen für deutsche V/E-Stationen

### Niederlande

| Quelle | Stärke für V/E Finder | Rolle |
|---|---|---|
| **NKC Campercontact** | sehr hoch – eigener Standorttyp `Serviceplatz`, Felder für Abwasser, Kassette, Wasser und teilweise Passanten-Nutzung | Priorität A, systematischer Deutschland-Abgleich |
| **Camperstop** | hoch – europaweite Stellplatz-/Serviceinformationen | zusätzlicher Lückenfinder |
| **KampeerHub** | mittel/hoch – 3.600+ Camperplätze in NL/Deutschland, Wasser-/Abwasserfelder | Lückenfinder für Stellplätze mit V/E |
| **Campersite.nl** | mittel – deutsche Grenzgebiete mit `S` = Wasser + Grau-/Schwarzwasser, `S+E` zusätzlich Strom | besonders später für West-/Nordwestdeutschland |

### Polen

| Quelle | Stärke für V/E Finder | Rolle |
|---|---|---|
| **Nomad Camper** | mittel – eigene Kategorien für Dump Stations und Wasser; Deutschland enthalten, aktueller Deutschland-Teilbestand aber klein | zusätzliche polnische Perspektive, Grenz-/Transitregionen |

### Tschechien

| Quelle | Stärke für V/E Finder | Rolle |
|---|---|---|
| **Camperguru** | mittel/hoch – tschechische Plattform, Deutschland-Katalog und Wohnmobilservice-Suche; kuratierte Auswahl | Qualitäts-/Kontrollquelle, nicht Vollbestand |
| **All4Camper / Vanisti / Caravan-Community** | ergänzend | Reiseberichte, App-Hinweise und Grenzregionen |
| **Camper Stops CZ & Motorhome** | für Tschechien sehr stark, Deutschland-Abdeckung bislang nicht als Vollbestand belegt | für spätere CZ-Erweiterung; aktuell keine Deutschland-Hauptquelle |

### Frankreich

| Quelle | Stärke für V/E Finder | Rolle |
|---|---|---|
| **park4night** | sehr hoch – Kategorie `VE ohne Parkmöglichkeit`; aktuelle Nutzerberichte | Priorität A für Lücken und Störungen |
| **CaraMaps** | sehr hoch – 100.000+ Adressen, Service Areas sowie Wasser/Entleerung | Priorität A/B |
| **Camping-car.com / Camping-Car Magazine** | hoch – eigener Deutschland-Katalog mit Service-/Camping-Aires, regionale Listen und konkrete Servicefelder | zusätzliche französische Gegenquelle |
| **Camping-Car Park** | sehr hoch bei eigenen deutschen Standorten – Betreiber-Netz mit Wasser und Grau-/Schwarzwasserentsorgung | Primär-/Betreiberquelle, wenn Standort direkt geführt wird |

### Belgien / Flandern

| Quelle | Stärke für V/E Finder | Rolle |
|---|---|---|
| **Duits-land.be** | ergänzend – konkrete V/E-Hinweise bei einzelnen deutschen Camping-/Camperstandorten | Einzelfund / Gegenprüfung |

### Italien

| Quelle | Stärke für V/E Finder | Rolle |
|---|---|---|
| **Camperonline** | ergänzend – Deutschland-Reiseberichte und Stellplatz-/Serviceangaben | historische/zusätzliche Gegenprüfung, Aktualität verifizieren |

## Direkte Nachbarländer – derzeitiger Quellenstatus

- **Niederlande:** sehr gut abgedeckt durch Campercontact, Camperstop, KampeerHub und Campersite.nl.
- **Belgien:** einzelne brauchbare Quellen, aber keine eigenständige belgische Deutschland-weite V/E-Datenbank bestätigt.
- **Luxemburg:** bislang keine eigenständige luxemburgische Deutschland-weite V/E-Datenbank bestätigt.
- **Frankreich:** sehr gut abgedeckt durch park4night, CaraMaps, Camping-car.com und Camping-Car Park.
- **Schweiz:** bislang keine eigenständige schweizerische Deutschland-weite V/E-Datenbank mit klarer Zusatzabdeckung bestätigt; beim Süd-Ausbau erneut prüfen.
- **Österreich:** bislang keine eigenständige österreichische Deutschland-weite V/E-Datenbank mit deutlichem Mehrwert gegenüber den europaweiten Portalen bestätigt; beim Bayern-/Süd-Ausbau erneut prüfen.
- **Tschechien:** Camperguru ist eine echte tschechische internationale Quelle; zusätzliche regionale Communityquellen vorhanden.
- **Polen:** Nomad Camper bietet eine echte polnische Europa-Perspektive, Deutschland-Bestand derzeit aber noch begrenzt.
- **Dänemark:** Deutschland-Reisebezug ist hoch, aber bislang keine eigenständige dänische Deutschland-weite V/E-Datenbank bestätigt.

## OSM-Audit – erste Ausbaustufe

Der automatisierte Vergleich konzentriert sich zunächst auf die sechs Bundesländer des aktuellen 466er Bestands:

- Berlin (`DE-BE`)
- Brandenburg (`DE-BB`)
- Mecklenburg-Vorpommern (`DE-MV`)
- Sachsen (`DE-SN`)
- Sachsen-Anhalt (`DE-ST`)
- Thüringen (`DE-TH`)

Berücksichtigt werden:

- `amenity=sanitary_dump_station`
- `sanitary_dump_station=yes`
- `sanitary_dump_station=public`
- `sanitary_dump_station=customers`

Mit übernommen werden, soweit vorhanden: Name, Betreiber, Zugang, Gebühr, Öffnungszeiten, Website, Frischwasser, Kassette/Chemietoilette und Grauwasser.

## Vergleichslogik

Weil einige Alt-Datensätze nur PLZ-genaue Koordinaten besitzen, wird nicht nur exakt auf Koordinaten verglichen:

- bis 300 m: starker räumlicher Treffer
- 300–1.500 m: möglicher Treffer, manuell prüfen
- über 1.500 m: OSM-Kandidat fehlt wahrscheinlich im V/E Finder

Zusätzlich muss der Audit räumlich nahe OSM-Objekte clustern, da mehrere Punkte derselben physischen V/E-Anlage sonst fälschlich als mehrere Stationen gezählt werden.

## Quellenregeln für jede Station

Für jede neu geprüfte Station sollen mindestens folgende Angaben gespeichert werden:

- `sources[]`
- `checked_at`
- `source_type`
- `source_url`
- `source_note`
- `verification_status`
- `confirms[]`
- `discovered_via`
- `source_owner_country`
- `source_dependency`

Zwei Fundstellen zählen nur dann als `cross_checked`, wenn sie tatsächlich unabhängig sind. Ein Portal, das OSM oder Campercontact übernimmt, ist **keine zweite unabhängige Bestätigung**.

## Nächste Audit-Reihenfolge

1. OSM-Vollabgleich in den sechs ostdeutschen Bundesländern weiter verifizieren und clustern.
2. Campercontact-Serviceplätze systematisch vergleichen.
3. park4night-Kategorie `VE ohne Parkmöglichkeit` systematisch vergleichen.
4. CaraMaps-Service Areas abgleichen.
5. Camping-car.com als zusätzliche französische Deutschland-Quelle prüfen.
6. Nomad Camper und Camperguru gezielt für Polen-/Tschechien-Perspektive und Grenzregionen auswerten.
7. Camperstop und KampeerHub als weitere Kontrollquellen einsetzen.
8. Herstellerlisten (CamperClean, SANI-STATION u. a.) gegen den Bestand prüfen.
9. Kommunen, Tourismusverbände und Tourist-Informationen systematisch nach Landkreis/Stadt durchsuchen.
10. Jeden echten Neufund über Primärquelle bestätigen und erst dann in den produktiven Bestand übernehmen.
11. Danach Deutschland auf alle 16 Bundesländer erweitern.
