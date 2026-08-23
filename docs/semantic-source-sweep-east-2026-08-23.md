# Vollständiger semantischer Quellenlauf – Ostdeutschland

Stand: 23.08.2026

## Abgegrenzter Projektumfang

Dieser Lauf gilt ausschließlich für die sechs vereinbarten Bundesländer:

- Berlin
- Brandenburg
- Mecklenburg-Vorpommern
- Sachsen
- Sachsen-Anhalt
- Thüringen

Andere Bundesländer werden weder als Treffer gezählt noch in die Datenbank übernommen. Der
Begriff „vollständig“ bezeichnet einen vollständigen, reproduzierbaren Durchlauf der definierten
öffentlichen Suchmatrix. Er ist keine Behauptung, dass loginpflichtige oder technisch nicht
indexierbare Fremddatenbanken vollständig ausgelesen werden konnten.

## Ausgeführte Matrix

Der Lauf kombiniert zwei Ebenen:

1. **370 semantische Abfragen** über jede registrierte Quelle, deren angebotene Sprachen und fünf
   Bedeutungsfamilien: Fremdnutzung, ohne Übernachtung, separater Zugang, Servicetarif sowie
   negative/verbietende Aussagen.
2. **210 Quellen-Länder-Abfragen**: 35 Quellen × 6 vereinbarte Bundesländer. Diese zweite Ebene
   verhindert, dass ein Portal nur durch deutschlandweite Spitzentreffer beurteilt wird.

Damit umfasst die reproduzierbare Projektmatrix **580 Abfragen**. Sie wird mit
`python3 scripts/generate_semantic_source_queries.py --project-matrix` erzeugt. Zusätzlich wurden
die strukturierten Felder von promobil und Stellplatzführer für alle sechs Länder gezielt geprüft.

Die Kategorien waren nicht auf Stellplätze beschränkt. Einbezogen waren reine V/E-Stationen,
Campingplätze, Parkplätze, Raststätten, Tankstellen, Autohöfe, Kläranlagen, Stadtwerke, Händler,
Werkstätten, Marinas, Häfen, Bauernhöfe, Hotels, Restaurants und private Plätze.

## Sprachen und Bedeutungen

Geprüft wurden Deutsch, Niederländisch, Französisch, Englisch, Polnisch, Tschechisch, Italienisch,
Spanisch, Portugiesisch und Dänisch. Entscheidend war nicht ein einzelner Wortlaut, sondern die
Bedeutung „V/E ohne Übernachtungszwang“. Dazu zählen unter anderem Fremdentsorgung,
Passantenservice, Service-only, dump-only, vor der Schranke, Quickstop, eigener Servicetarif und
reine Entsorgungsstation. Negative Angaben wie „nur für Gäste“ oder „keine V/E für Durchreisende“
wurden ebenfalls gesucht und schlagen ältere positive Hinweise.

## Quellenabdeckung

Alle 35 Einträge in `docs/source-registry.json` waren Bestandteil der Matrix. Öffentliche
Fundseiten waren bei 30 Quellen auffindbar:

AlpacaCamping, BORDATLAS, Reisemobil International, promobil, stellplatz.info,
Stellplatzführer, PiNCAMP, camping.info, FREEONTOUR, StayFree, PlatzX, Nomady, park4night,
Campercontact, Camperstop, CaraMaps, Camping-Car Park, Camping-Car Magazine, Camperguru,
Nomad Camper, iOverlander, Camperonline, DumpLocations, Campingcar76, Mapa Furgocasa,
Campercation, Mobilisten, WHATABUS, CamperClean und OpenStreetMap.

Bei **VanSite, TopPlatz, Campersite.nl, KampeerHub und Duits-land.be** lieferte die öffentliche
Suchmatrix keine indexierte Detailseite. Das ist als Zugriffs-/Indexierungsgrenze dokumentiert und
nicht als Beleg dafür zu verstehen, dass diese Portale keine passenden Datensätze besitzen.

## Verifiziertes Ergebnis

- **40 positive, einzeln geprüfte Quellennachweise** im Projektgebiet
- davon **39 promobil-Detailseiten** und **1 Stellplatzführer-Detailseite**
- **35 Treffer** gehören zu bereits vorhandenen physischen Stationen; sie wurden nicht dupliziert,
  sondern mit exakten Koordinaten, aktuellem Preis, Saison und strukturiertem Quellenbeleg ergänzt
- **5 echte Neufunde** wurden aufgenommen
- produktiver Bestand danach: **498 Stationen**

### Neue Stationen

| ID | Bundesland | Station | Durchreise-V/E | Saison |
|---|---|---|---|---|
| `ve-494` | Brandenburg | Naturcamp Gleuensee, Templin | kostenlos | Mai bis Oktober |
| `ve-495` | Mecklenburg-Vorpommern | Wohnmobilpark am See, Neukloster | 5 EUR | ganzjährig laut Quelle |
| `ve-496` | Sachsen | Bad Sonnenland, Moritzburg | 10 EUR | April bis Oktober |
| `ve-497` | Thüringen | Alte Heuschupfe, Lederhose | 3 EUR | Winter-V/E laut Quelle verfügbar |
| `ve-498` | Sachsen-Anhalt | Bahlmanns Radwelt & Freizeitressort, Sangerhausen | 1 EUR; Grauwasser 0,50 EUR | ganzjährig |

Die maschinenlesbaren 40 Positivnachweise stehen in
`docs/semantic-source-sweep-east-2026-08-23.json`. Das idempotente Einspielskript
`scripts/apply_v42_full_semantic_sweep.py` erzeugt beim ersten Lauf 35 Aktualisierungen und fünf
Neuanlagen; ein zweiter Lauf erzeugt keine Dubletten.

## Negative und widersprüchliche Befunde

Negative Aussagen wurden nicht als Treffer importiert. Insbesondere bleibt der vorhandene
Datensatz zum Wohnmobilpark Priepert rot, weil die Detailquelle die V/E für Durchreisende
ausdrücklich ausschließt. Die Rosenstädter Wohnmobiloase wurde nach einem zunächst
widersprüchlichen Zusammenfassungstext erneut direkt geprüft: Das aktuelle strukturierte Feld
nennt 5 EUR für Durchreisende, Winterbetrieb und eine aktuelle Bewertung vom August 2026. Der
positive Datensatz bleibt daher grün und enthält nun beide Fachquellen.

## Prüfbarkeit und Wiederholung

Die Datenbank wurde nach der Einspielung erneut dekodiert und geprüft:

- 498 Datensätze
- 498 eindeutige IDs
- ausschließlich die sechs vereinbarten Bundesländer
- Datenverteilung: Berlin 10, Brandenburg 113, Mecklenburg-Vorpommern 129, Sachsen 115,
  Sachsen-Anhalt 75, Thüringen 56
- zweiter Skriptlauf: 40 Aktualisierungen, 0 Neuanlagen

Die fünf nicht öffentlich indexierbaren Portale und später auftauchende neue Detailseiten bleiben
Aufgaben für Wiederholungsläufe; sie ändern nicht den dokumentierten Abschluss dieser
öffentlichen 580-Abfragen-Matrix.
