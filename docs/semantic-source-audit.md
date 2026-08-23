# V/E Finder – Semantischer und internationaler Quellenabgleich

Stand: 2026-08-23

## Grundsatz

Gesucht wird nicht nach einem bestimmten Satz, sondern nach der Bedeutung:

> Ein Wohnmobil darf eine vorhandene Ver- oder Entsorgungsleistung nutzen, ohne dort übernachten
> zu müssen.

Der Abgleich darf deshalb weder auf eine Plattform-Kategorie noch auf Formulierungen wie
`für Durchreisende` oder `auch ohne Übernachtung` begrenzt werden. Er umfasst alle Standortarten
und alle Sprachen, in denen eine Quelle deutsche Standorte beschreibt.

## Standortarten

- reine V/E- oder Servicestelle
- Wohnmobilstellplatz und Reisemobilhafen
- Campingplatz und Quickstop
- Parkplatz und Raststätte
- Tankstelle und Autohof
- Kläranlage, Stadtwerke und kommunaler Betriebshof
- Wohnmobilhändler, Werkstatt und Hersteller
- Marina, Hafen und Wassersportzentrum
- Bauernhof, Hotel, Restaurant und privater Stellplatz

Eine V/E kann als eigener Kartenpunkt, als Leistung eines Übernachtungsplatzes oder als separate
Anlage vor bzw. neben dessen Zufahrt geführt sein.

## Bedeutungsfamilien

Die Suche berücksichtigt mindestens diese Aussagen:

1. **direkte Fremdnutzung:** Durchreisende, Passanten, Nichtgäste, externe Wohnmobile,
   Besucher ohne Stellplatzbuchung
2. **kein Übernachtungszwang:** ohne Übernachtung, nur V/E, Service-only, vidange seule,
   zonder overnachting, bez přenocování
3. **eigener Kurzzeittarif:** V/E-Pauschale, Fremdentsorgungspreis, fünf Stunden plus Dienste,
   Quickstop- oder Servicetarif
4. **baulich separater Zugang:** vor der Einfahrt, vor/außerhalb der Schranke, neben dem Platz,
   separate Servicestation
5. **reiner Servicestellentyp:** Entsorgungsstation, Servicestelle, dump station, serviceplaats,
   aire de services, stacja zrzutu, servisní místo
6. **negative Aussagen:** nur für Gäste, keine Fremdentsorgung, Übernachtung erforderlich,
   Kundenkarte plus gebuchte Nacht, saisonal oder vorübergehend geschlossen

## Sprachen

Der aktuelle Pflichtsatz umfasst Deutsch, Niederländisch, Französisch, Englisch, Polnisch,
Tschechisch, Italienisch, Spanisch, Portugiesisch und Dänisch. Neue relevante Sprachräume werden
ergänzt, sobald eine weitere Quelle Deutschland-Daten führt.

Beispiele für gleichbedeutende Signale:

| Sprache | Beispiele |
|---|---|
| Deutsch | Fremdentsorgung, für Passanten, nur V/E, vor der Schranke, Kurzzeitservice |
| Niederländisch | campers op doorreis, zonder overnachting, alleen lozen, serviceplaats |
| Französisch | camping-cars de passage, sans nuitée, vidange seule, forfait services |
| Englisch | passing motorhomes, non-guests, without overnight stay, service only |
| Polnisch | kampery przejazdem, bez noclegu, tylko serwis, stacja zrzutu |
| Tschechisch | pro neubytované, bez přenocování, pouze servis, servisní místo |
| Italienisch | camper di passaggio, senza pernottamento, solo carico/scarico |
| Spanisch | autocaravanas de paso, sin pernoctar, solo carga y descarga |
| Portugiesisch | autocaravanas de passagem, sem pernoita, apenas serviços |
| Dänisch | autocampere på gennemrejse, uden overnatning, kun service |

## Quellenumfang

Das maschinenlesbare Register `docs/source-registry.json` enthält derzeit 35 Portale und
Hersteller-/Open-Data-Quellen. Zusätzlich werden Betreiber, Kommunen, Tourismusverbände,
Stadtwerke, Kläranlagen, Händler, Häfen sowie öffentlich sichtbare Social-Media-Beiträge als
offene Primärquellenklasse geprüft.

`alle Quellen` bedeutet im Audit deshalb:

- jede Quelle im gepflegten Register,
- alle relevanten Kategorien innerhalb der Quelle,
- alle angebotenen Sprachfassungen mit eigenständigem Inhalt,
- alle 16 Bundesländer,
- regelmäßige Ergänzung des Registers um neu gefundene Quellen.

Es bedeutet nicht, dass eine Suchmaschine jede Seite eines fremden Portals garantiert indexiert.
Loginpflichtige oder technisch nicht exportierbare Bestände werden als solche markiert und über
deren öffentliche Einzelseiten, Betreiberquellen und unabhängige Gegenquellen kontrolliert.

## Bewertungslogik

- Eine bloße Ausstattungsliste bestätigt die V/E, aber nicht automatisch die Fremdnutzung.
- Ein eigenständiger Servicetarif oder eine ausdrückliche Nichtgast-/Passantenregel bestätigt den
  Zugang auch dann, wenn das Wort `Durchreisende` fehlt.
- `vor der Schranke` oder `separate Station` ist ein starkes Zugangssignal, wird aber möglichst
  durch Tarif, Betreiberangabe oder aktuelle Nutzungsmeldung ergänzt.
- Neuere offizielle Verbote oder Einschränkungen schlagen ältere positive Communitymeldungen.
- Abhängige Kopien derselben Ursprungsquelle zählen nicht als zwei unabhängige Belege.
- Grün erfordert belastbare Zugangs- und Leistungsbelege; unvollständige Funde bleiben Gelb/Weiß.

## Erste Ergebnisse der erweiterten Methode

- `ve-339` Auerbach-Beerheide: Der französische Betreiber Camping-Car Park nennt nicht
  `Durchreisende`, sondern den eigenen Tarif `Parken 5h + Dienste` für 6 EUR. Zusammen mit der
  kommunal bestätigten Wasser-/Abwasseranlage ist die Durchreise-V/E damit grün verifiziert.
- `ve-351` Coswig/Anhalt: park4night beschreibt eine separate Station nahe der Autobahn;
  promobil nennt unabhängig eine V/E für Durchreisende zu 5 EUR. Der vorhandene gelbe Datensatz
  wird grün und erhält die exakte Position.

Diese beiden Korrekturen sind Beispiele für den neuen Ansatz, nicht der Abschluss des
Gesamtabgleichs.
