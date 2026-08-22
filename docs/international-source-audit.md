# V/E Finder – internationale Quellen für deutsche V/E-Stationen

Stand: 2026-08-22

## Ziel

Neben deutschen Kommunen, Tourismusstellen, Betreibern und Portalen sollen gezielt Quellen aus den Nachbarländern ausgewertet werden. Der Nutzen ist nicht, fremde Datenbanken zu kopieren, sondern deutsche V/E-Stationen zu finden, die in deutschen Quellen oder im bisherigen V/E-Finder-Bestand fehlen oder anders beschrieben werden.

Internationale Portale bleiben **Entdeckungs- und Kontrollquellen**. Eine Station wird erst nach Abgleich mit einer belastbaren Primärquelle (Betreiber, Kommune, Tourist-Information, Hersteller) als bestätigt übernommen.

## Priorität A – systematisch abgleichen

### Polen – Nomad Camper

- Quelle: https://nomadcamper.pl/mapa-kamperowa
- Polnische Karte für Polen und Europa.
- Deutschland ist ausdrücklich als abgedecktes Land genannt.
- Eigene Kategorien für `stacje zrzutu` (Entsorgungsstationen) und `punkty wodne` (Wasserstellen).
- Sehr interessant für Brandenburg, Mecklenburg-Vorpommern und Sachsen sowie Transitachsen Richtung Polen.
- Rolle: neue Kandidaten entdecken; anschließend deutsche Primärquelle suchen.

### Niederlande – NKC Campercontact

- Quelle: https://www.campercontact.com/
- Niederländische Plattform/NKC mit europaweiter Datenbank.
- Unterscheidet ausdrücklich Wohnmobilplätze, Campingplätze und **Serviceplätze**.
- Deutsche Serviceplätze enthalten Felder für Abwasser, Kassette, Wasser und teilweise „Ausstattung für Passanten“.
- Besonders wertvoll, weil reine Durchreise-V/E als eigener Standort erfasst sein kann.
- Rolle: systematischer Deutschland-Abgleich, besonders Serviceplätze.

### Niederlande – Camperstop

- Quelle: https://camperstop.com/
- Herausgeber Facile Media, Tilburg/Niederlande.
- Europaweite Stellplatz-/Servicequelle mit Angaben zu Wasser und Entsorgung.
- Rolle: zweite niederländische Entdeckungsquelle; Treffer anschließend gegen Primärquelle prüfen.

### Frankreich – park4night

- Quelle: https://www.park4night.com/
- Sehr große europäische Community.
- Für unser Ziel besonders interessant ist die eigene Kategorie **„VE ohne Parkmöglichkeit“ / service area without parking**.
- Diese Kategorie passt sehr gut zum V/E-Finder, weil sie reine Ver-/Entsorgungsstellen sichtbar macht, die klassische Stellplatzlisten leicht übersehen.
- Nutzerberichte können außerdem aktuelle Defekte oder saisonale Einschränkungen aufdecken.
- Rolle: Lückensuche und Aktualitätskontrolle, niemals alleinige Bestätigung.

### Frankreich – CaraMaps

- Quelle: https://www.caramaps.com/
- Bereits in der allgemeinen Quellenliste enthalten.
- Europaweite Community-/Reiseplattform mit Servicefiltern.
- Rolle: ergänzender französischer Abgleich; keine automatische Übernahme.

## Priorität B – zusätzliche Perspektive

### Niederlande – KampeerHub

- Quelle: https://kampeerhub.nl/camperplaatsen
- Niederländischsprachige Karte mit tausenden Camperplätzen in Niederlande und Deutschland.
- Deutsche Treffer lassen sich nach Leistungen wie Wasseraufnahme und Abwasserentsorgung erkennen.
- Enthält auch zahlreiche Einträge aus den aktuell bearbeiteten ostdeutschen Bundesländern.
- Rolle: Lückenfinder; Herkunft einzelner Datensätze muss vor Nutzung geprüft werden, damit wir keine abhängigen/duplizierten Quellen als unabhängige Bestätigung zählen.

### Belgien/Flandern – Duits-land.be

- Quelle: https://www.duits-land.be/
- Belgisch/niederländischsprachiges Deutschland-Reiseportal mit Camping- und Camperinformationen.
- Einzelne deutsche Camping-/Camperstandorte enthalten sehr konkrete Hinweise auf Wasser, Abwasser, Chemietoilette oder Holiday-Clean-Anlagen.
- Rolle: ergänzende Fundquelle; primär für Anlagen auf Campingplätzen und touristischen Standorten.

### Tschechien – All4Camper / Vanisti / Caravan-Community

- Quellen: https://all4camper.com/ und https://www.vanisti.cz/
- Tschechische Caravan-Reiseseiten beschäftigen sich ausdrücklich mit Reisen nach Deutschland und empfehlen europaweite Apps wie Campercontact und park4night.
- All4Camper beschreibt bei den App-Typen sogar die Suche nach Orten nur zum Ablassen von Abwasser/WC und zum Frischwasserfüllen.
- Vanisti verweist außerdem auf die tschechische Community-Karte caravan24.cz.
- Aktuell wurde noch keine tschechische, Deutschland-weit gepflegte reine V/E-Datenbank gefunden, die Campercontact/park4night vergleichbar wäre.
- Rolle: tschechischsprachige Reiseberichte und Grenzregionen als zusätzliche Hinweise durchsuchen; globale App-Daten nicht doppelt als „tschechische zweite Quelle“ zählen.

## Weitere Länder

- Italien: Camperonline.it und ähnliche Reise-/Communityseiten können historische oder touristische Hinweise auf deutsche Serviceplätze liefern; niedrige Priorität, weil Angaben oft Reiseberichte und nicht laufend gepflegte Stationsdaten sind.
- Österreich/Schweiz: bei späterer Erweiterung nach Süddeutschland gezielt lokale Caravanclubs, Stellplatzportale und Tourismusquellen ergänzen.
- Dänemark/Skandinavien: besonders für Mecklenburg-Vorpommern und die Ostsee perspektivisch sinnvoll, sobald der Nordosten vollständig abgearbeitet wird.

## Wichtige Regel: Quellenabhängigkeit erkennen

Zwei Webseiten sind nicht automatisch zwei unabhängige Bestätigungen. Manche Reiseportale übernehmen Daten aus Campercontact, park4night, OSM oder derselben Betreiberquelle. Deshalb soll künftig pro Fund zusätzlich festgehalten werden:

- `discovered_via` – wo wurde der Kandidat gefunden?
- `source_owner_country` – Herkunft der Quelle/Plattform
- `source_dependency` – z. B. `independent`, `osm-derived`, `campercontact-derived`, `unknown`
- `primary_confirmation` – Betreiber/Kommune/Tourismus/Hersteller

Nur wirklich unabhängige Quellen dürfen den Status `cross_checked` begründen.

## Empfohlene Reihenfolge für Ostdeutschland

1. OSM-Kandidaten weiter verifizieren.
2. Nomad Camper: deutsche Entsorgungs-/Wasserpunkte gegen unseren Bestand prüfen.
3. Campercontact: deutsche **Serviceplätze** in den sechs Bundesländern abgleichen.
4. park4night: Kategorie **VE ohne Parkmöglichkeit** in den sechs Bundesländern abgleichen.
5. Camperstop und KampeerHub als weitere niederländische Kontrollquellen.
6. Tschechische und polnische Reise-/Communityquellen speziell entlang der Grenzregionen Sachsen/Brandenburg durchsuchen.
7. Jeden echten Neufund anschließend mit deutscher Primärquelle bestätigen und mit vollständiger Quellenhistorie speichern.
