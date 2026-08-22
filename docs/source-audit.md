# V/E Finder – Quellen-Audit

Stand: 2026-08-22

## Ziel

Die Stationsdaten sollen nicht von einer einzelnen Plattform abhängen. Jede Station soll möglichst durch mindestens eine offene oder offizielle Quelle belegbar sein; bei wichtigen Angaben wie öffentlich zugänglich, Grauwasser, Kassette, Frischwasser und Gebühren sind zwei voneinander unabhängige Hinweise ideal.

## Aktueller Befund im Repository

- Der produktive Bestand umfasst 461 Stationen und wird als gzip-komprimierte, Base64-geteilte JSON-Datei geladen.
- Im Repository gibt es bislang **kein separates Quellenregister pro Station**. Dadurch ist später nicht direkt nachvollziehbar, welche Quelle eine einzelne Angabe bestätigt hat.
- Das sollte bei der nächsten Datenbankstufe geändert werden: `sources[]`, `checked_at`, `source_type` und optional `source_url`/`source_note` pro Station.

## Quellenklassen

| Quelle / Klasse | Rolle im V/E Finder | Status im Audit | Bemerkung |
|---|---|---|---|
| OpenStreetMap / Overpass | offene Grund- und Vergleichsquelle | **Audit läuft** | `amenity=sanitary_dump_station`, `sanitary_dump_station=yes/public/customers`; ODbL/Attribution beachten |
| Kommunen / Stadtverwaltungen | Primärbestätigung | **prioritär** | besonders für öffentliche Stellplätze, Kläranlagen, Parkplätze |
| Tourismusverbände / Tourist-Informationen | Primärbestätigung / Neufunde | **prioritär** | oft aktuelle kommunale Stellplatzinformationen |
| Betreiber / Stellplatz-Webseiten | Primärbestätigung | **prioritär** | Zugang, Preis, Öffnungszeiten und Leistungen |
| Stadtwerke / Kläranlagen | Primärbestätigung | **prioritär** | häufig unbekannte öffentliche V/E-Punkte |
| CamperClean | Hersteller-/Betreiberhinweis | **zu prüfen** | gute Quelle zum Auffinden installierter Anlagen |
| SANI-STATION / weitere Anlagenhersteller | Hersteller-/Referenzquelle | **zu prüfen** | Referenzlisten können neue Kandidaten liefern |
| Caravan-/Wohnmobilhändler | Betreiberquelle | **zu prüfen** | viele Händler bieten V/E oder Frischwasser an |
| Tankstellen / Autohöfe / Raststätten | Betreiberquelle | **zu prüfen** | einzelne öffentlich nutzbare Stationen |
| Marinas / Häfen | Betreiberquelle | **zu prüfen** | sorgfältig prüfen, ob Wohnmobile tatsächlich Zugang haben |
| AlpacaCamping | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | nicht als Datenbank kopieren; Treffer über Primärquelle bestätigen |
| Campercontact | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | Angaben anschließend verifizieren |
| BORDATLAS / Reisemobil International | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | keine pauschale Übernahme der Datenbank |
| promobil | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | Betreiber-/Kommunalquelle zur Bestätigung suchen |
| Park4Night | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | Community-Angaben nicht ungeprüft übernehmen |
| Camperstop | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | zur Lückensuche |
| CaraMaps | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | zur Lückensuche |
| Camperguru | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | zur Lückensuche |
| VanSite | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | vor allem Betreiberangebote |
| iOverlander | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | Community-Daten, deshalb verifizieren |
| stellplatz.info | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | zur Lückensuche |
| PiNCAMP | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | Campingplätze; öffentliche Durchreise-V/E gesondert prüfen |
| FREEONTOUR | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | zur Lückensuche |
| StayFree | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | zur Lückensuche |
| Camping.info | Entdeckungs-/Kontrollquelle | **gelistet, systematischer Abgleich offen** | Campingplätze; Zugänglichkeit ohne Übernachtung prüfen |
| Google Maps | Entdeckungs-/Plausibilitätsquelle | **ergänzend** | keine automatisierte Übernahme; Betreiber-Webseite bevorzugen |

## OSM-Audit – erste Ausbaustufe

Der erste automatisierte Vergleich konzentriert sich auf die sechs Bundesländer, die im aktuellen 461er Bestand enthalten sind:

- Berlin (`DE-BE`)
- Brandenburg (`DE-BB`)
- Mecklenburg-Vorpommern (`DE-MV`)
- Sachsen (`DE-SN`)
- Sachsen-Anhalt (`DE-ST`)
- Thüringen (`DE-TH`)

Aus OSM werden berücksichtigt:

- `amenity=sanitary_dump_station`
- Objekte mit `sanitary_dump_station=yes`
- zusätzlich `sanitary_dump_station=public` und `sanitary_dump_station=customers`, damit Anlagen auf Stell-/Campingplätzen und Marinas nicht verloren gehen

Mit übernommen werden, soweit vorhanden: Name, Betreiber, Zugang, Gebühr, Öffnungszeiten, Website, Frischwasser-Hinweis, Kassette/Chemietoilette und Grauwasser.

## Vergleichslogik

Da einige Alt-Datensätze im V/E Finder nur PLZ-genaue Koordinaten besitzen, wird nicht nur auf exakte Koordinaten verglichen:

- bis 300 m: starker räumlicher Treffer
- 300–1.500 m: möglicher Treffer, manuell prüfen
- über 1.500 m: OSM-Kandidat fehlt wahrscheinlich im V/E Finder

Der Bericht ist ausdrücklich eine **Kandidatenliste**, kein automatischer Import. Vor einer Übernahme sollen Zugang und Leistungen anhand einer Betreiber-, Kommunal- oder Tourismusquelle bestätigt werden.

## Nächste Audit-Reihenfolge

1. OSM-Vollabgleich für die sechs vorhandenen Bundesländer.
2. Herstellerlisten (CamperClean, SANI-STATION u. a.) gegen den Bestand.
3. Kommunen, Tourismusverbände und Tourist-Informationen systematisch nach Landkreis/Stadt durchsuchen.
4. Wohnmobilportale als Lückenfinder verwenden und jeden Neufund über eine Primärquelle verifizieren.
5. Danach Deutschland auf alle 16 Bundesländer erweitern.
