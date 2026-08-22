# Erster OSM-Abgleich – Ergebnisse

Stand: 2026-08-22

Der verfeinerte OSM-Abgleich wurde erfolgreich für die sechs derzeit im V/E-Finder-Bestand enthaltenen Bundesländer ausgeführt.

## Gesamtbild

- V/E-Finder-Bestand: 461 Stationen
- gefundene OSM-Objekte mit `amenity=sanitary_dump_station` bzw. `sanitary_dump_station=yes/public/customers`: 860
- starke Treffer gegen vorhandenen Bestand: 132
- mögliche Treffer, die manuell geprüft werden müssen: 144
- OSM-Objekte ohne ausreichenden Match: 584
- davon prioritäre OSM-Neukandidaten (öffentlich / eigenständige Station / Zugang noch zu klären): 147

Die 584 Objekte ohne ausreichenden Match sind ausdrücklich **nicht** mit 584 fehlenden öffentlichen V/E-Stationen gleichzusetzen. OSM enthält auch Campingplatz-, Marina- und Kundenanlagen. Außerdem besitzen einige ältere V/E-Finder-Datensätze nur PLZ-genaue Koordinaten.

## OSM-Objekte nach Nutzbarkeit

- ausdrücklich öffentlich (`public_explicit`): 39
- eigenständige V/E-Station, Zugang unklar (`standalone_access_unknown`): 134
- V/E-Service an anderem Objekt, Zugang unklar (`service_access_unknown`): 9
- Camping-/Caravanplatz-Service (`site_service`): 485
- Marina-/Hafen-Service (`marina_service`): 51
- eingeschränkt / Kunden / privat / Permit (`restricted`): 142
- ausdrücklich nicht für Wohnmobile (`not_for_motorhomes`): 0

## Nach Bundesland

| Bundesland | OSM gesamt | starke Treffer | mögliche Treffer | prioritäre Neukandidaten |
|---|---:|---:|---:|---:|
| Berlin | 18 | 4 | 1 | 0 |
| Brandenburg | 185 | 22 | 31 | 34 |
| Mecklenburg-Vorpommern | 310 | 64 | 45 | 45 |
| Sachsen | 146 | 21 | 34 | 30 |
| Sachsen-Anhalt | 102 | 11 | 23 | 13 |
| Thüringen | 99 | 10 | 10 | 25 |

## Weiteres Vorgehen

Die 147 prioritären Kandidaten werden **nicht automatisch importiert**. Zuerst werden die 39 in OSM ausdrücklich als öffentlich gekennzeichneten Kandidaten und anschließend die eigenständigen V/E-Stationen gegen Betreiber-, Kommunal-, Tourismus- oder Herstellerquellen geprüft. Erst bestätigte Stationen sollen als Vorschlag für die produktive Datenbank übernommen werden.
