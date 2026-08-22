# Breiter Quellen-Sweep – Batch 1

Stand: 2026-08-22

Ziel: Nicht nur einzelne Startpunkte prüfen, sondern kommunale Seiten, Betreiberpreise, Tourism Open Data, Fachregister, Community-Hinweise, öffentliche Social-Media-Posts und Negativbelege über alle sechs ostdeutschen Bundesländer gegeneinander abgleichen.

## Ergebnis

- 26 neue grüne Datensätze (`ve-467` bis `ve-492`)
- 31 vorhandene Datensätze neu geprüft oder präzisiert
- Gesamtbestand von 466 auf 492 Stationen erhöht
- alle neuen Punkte gegen den Altbestand räumlich geprüft; kleinster Abstand zu einem vorhandenen, aber klar getrennten Betrieb: 1,37 km
- Campingplätze nur aufgenommen, wenn V/E für Durchreisende ausdrücklich genannt oder bepreist wird

## Neue bestätigte Stationen

| ID | Bundesland | Station | Durchreise-V/E | Hauptquelle |
|---|---|---|---|---|
| `ve-467` | Thüringen | Badehaus Nordhausen | 6 EUR; zu Öffnungszeiten | Stadt Nordhausen + BORDATLAS |
| `ve-468` | Brandenburg | Bäckerei Plentz Velten | 5 EUR | Betreiber |
| `ve-469` | Brandenburg | Bäckerei Plentz Schwante | 5 EUR | Betreiber + promobil |
| `ve-470` | Mecklenburg-Vorpommern | Naturcamping Lassan | 5 EUR | Betreiberpreisliste |
| `ve-471` | Thüringen | Ilmenau Wiesenweg/P2 | Entsorgung frei; Wasser nach Menge | Stadt Ilmenau |
| `ve-472` | Thüringen | Campingplatz Paulfeld | 5 EUR | promobil |
| `ve-473` | Mecklenburg-Vorpommern | Ferienhaus Wendorf-Teschenhagen | 5 EUR | promobil |
| `ve-474` | Sachsen | Familie Teichmann, Struppen | 10 EUR | promobil |
| `ve-475` | Thüringen | Rastenberg-Finneck | 2,50 EUR | promobil |
| `ve-476` | Thüringen | WOMO Bahnhof Friedrichroda | 5 EUR | promobil |
| `ve-477` | Brandenburg | Spreewald-Natur-Camping Hindenberg | 5 EUR | promobil |
| `ve-478` | Sachsen | Am Vorwerk Kummersheim | 5 EUR | promobil |
| `ve-479` | Thüringen | Tor zur Stadt Erfurt | 3 EUR | promobil + BORDATLAS |
| `ve-480` | Berlin | RZB Reisemobil-Zentrum | 4 EUR | promobil |
| `ve-481` | Sachsen-Anhalt | STRANDPARX Magdeburg | 10 EUR | promobil |
| `ve-482` | Brandenburg | Campingplatz am Mahlower See | 8 EUR | promobil |
| `ve-483` | Brandenburg | Marienhafen Werbelliner Kreuz | 10 EUR; Teilservice | promobil |
| `ve-484` | Sachsen | Zur Platane, Mohorn | 4 EUR | promobil |
| `ve-485` | Brandenburg | Stellplatz Szonn | 4 EUR | promobil |
| `ve-486` | Brandenburg | Wasserwanderraststation Mühlberg/Elbe | 1 EUR; Wasser offen | promobil |
| `ve-487` | Mecklenburg-Vorpommern | Natur- und Strandcamping Jabel | 5 EUR | promobil |
| `ve-488` | Thüringen | Campingplatz Drei Gleichen | 5 EUR | promobil |
| `ve-489` | Thüringen | Wohnmobilstellplatz Oberhof | 5 EUR | promobil |
| `ve-490` | Thüringen | Am Gartenberg Ostramondra | 2,50 EUR | Betreiber/TopPlatz + promobil |
| `ve-491` | Thüringen | Rohrer Stirn Meiningen | 2,50 EUR | promobil |
| `ve-492` | Thüringen | Auszeit Lindigshof | kostenlos | Betreiber + promobil |

## Neu bestätigte Altbestände

Auf Grün gesetzt oder als bereits grün präzisiert wurden:

`ve-7`, `ve-16`, `ve-24`, `ve-28`, `ve-30`, `ve-38`, `ve-58`, `ve-62`, `ve-66`, `ve-79`, `ve-134`, `ve-185`, `ve-204`, `ve-259`, `ve-261`, `ve-282`, `ve-295`, `ve-301`, `ve-352`, `ve-355`, `ve-369`, `ve-385`, `ve-393`, `ve-394`, `ve-397`, `ve-402`, `ve-425`, `ve-441`, `ve-445`, `ve-454`, `ve-457`.

Wesentliche Korrekturen betreffen insbesondere exakte Koordinaten, aktuelle Preise, Telefonkontakte und fehlende Frischwasser-/Müllfelder. Preis- oder Leistungswidersprüche bleiben ausdrücklich im Hinweistext erhalten.

## Nicht automatisch übernommen

- Welzow Flugplatz und Tribsees: V/E vorhanden, aber reine Durchreise-Nutzung noch nicht primär belegt.
- Alte Heuschupfe Neuensorga: widersprüchliche aktuelle Angaben zur Kassette und zum tatsächlichen Anlagenbetrieb.
- Hainichen Esso Autohof: Fachquelle meldet Rückbau 2022, Communityquelle meldet 2026 wieder Betrieb; Betreiberbestätigung fehlt.
- Priepert: V/E für Durchreisende ist ausdrücklich untersagt; kein grüner Datensatz.
- geschlossene Facebook-/Instagram-Gruppen: nicht reproduzierbar zugänglich; Hinweise daraus dürfen erst nach offener Gegenprüfung einfließen.

## Durchsuchte Quellengruppen

1. Kommunen, Stadtwerke, Mängelmelder und Tourismusportale
2. Betreiberseiten und Tarif-/Preislisten
3. BORDATLAS-Entsorgungsstationsliste und Detailseiten
4. promobil und Stellplatzführer mit strukturiertem Durchreise-Feld
5. Tourism Open Data: SaTourN, Brandenburg-Contentnetz, ThüCAT, MV-Datenbank, DZT Knowledge Graph
6. Marinas, Campingplätze, Caravanbetriebe, Autohöfe und Händler
7. OpenStreetMap/Overpass, Karten- und Fotohinweise zur Lageprüfung
8. öffentliche Social-Media- und Community-Beiträge als Störungs- oder Konflikthinweis

Der Transformationslauf ist mit `scripts/apply_v36_deep_source_sweep.py` reproduzierbar; er verarbeitet den unveränderten v3.5-Ausgangsbestand und kann auf dem v3.6-Ergebnis sicher erneut ausgeführt werden.
