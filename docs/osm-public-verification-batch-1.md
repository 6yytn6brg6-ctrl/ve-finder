# OSM-Prüfung: ausdrücklich öffentliche Kandidaten – Batch 1

Stand: 2026-08-22

Ziel: Die in OSM als öffentlich/zugänglich markierten V/E-Kandidaten werden gegen Primärquellen geprüft. Kein Eintrag wird allein aufgrund von OSM automatisch in die produktive Datenbank übernommen.

## Ergebnisübersicht

| Kandidat | Einordnung | Ergebnis |
|---|---|---|
| NaturTherme Templin | neuer Kandidat | V/E ist durch Betreiber bestätigt: Frischwasser, automatische und manuelle Entsorgung, CamperClean. Durchreise-Nutzung ohne Stellplatzübernachtung ist auf der Betreiberseite nicht ausdrücklich beschrieben; deshalb vor Import noch Zugang für reine V/E-Nutzung klären. |
| Rüdersdorf, Museumspark/Heinitzstraße | bereits vorhanden | Kein neuer Standort. Gemeinde bestätigt Abwasser-/Fäkalienentsorgung. Aktuell ist die Campingsäule wegen Vandalismus teilweise außer Betrieb: kein Strom und kein Trinkwasser; Abwasserentsorgung weiter möglich. Bestehenden Datensatz aktualisieren. |
| Bad Belzig, SteinTherme | bereits vorhanden | Kein neuer Standort. Betreiber bestätigt Wasser- und Abwasserversorgung am Reisemobilstellplatz; Abwasser ist in der Stellplatzgebühr enthalten, Frischwasser gegen Gebühr. |
| Mirow, Schloßinsel | bereits vorhanden | OSM-Objekt gehört zur bestehenden SANI-Station/Schlossparkplatz. Kein neuer Standort. Betriebszustand sollte separat aktuell geprüft werden, da jüngste Nutzerberichte zeitweilige Defekte nennen. |
| Hoyerswerda, Gondelteich/Lausitzbad | bereits vorhanden | Kein neuer Standort. Stadt Hoyerswerda bestätigt Strom, Wasser und Abwasser sowie getrennte Nutzungsgebühren. |
| Waldgasthof Bad Einsiedel, Seiffen | bereits vorhanden | Kein neuer Standort. Betreiber bestätigt Wasser und Entsorgung auf dem Gelände. |
| Zerbst/Anhalt, Wolfsbrücke/Volksschwimmhalle | bereits vorhanden | Kein neuer Standort. Tourismus-/Stadtquellen bestätigen Strom, Wasser sowie Entsorgung von Brauchwasser und Chemie-WC. |
| Magdeburg, Petriförder | bereits vorhanden / Statuskonflikt | Kein neuer Standort. Offizielle Magdeburger Seiten widersprechen sich: eine aktuelle Adressseite sagt „keine Ver- und Entsorgung“, eine offizielle Meldung von 2024 bestätigt die reparierte V/E-Station mit Frischwasser und Brauchwasserentsorgung. Vor Datenänderung aktuellen Betrieb direkt verifizieren. |
| Eisenach, Karl-Marx-Straße | bereits vorhanden | Kein neuer Standort. Eisenach-Tourismus bestätigt Ver-/Entsorgungsanlage für Wasser und Abwasser sowie Strom. |
| Mühlhausen, Engelsgarten | bereits vorhanden, mehrere OSM-Objekte | Die vier öffentlichen OSM-Punkte an praktisch identischer Position sind Komponenten/einzelne Objekte derselben V/E-Anlage und keine vier neuen Stationen. Stadt Mühlhausen bestätigt Frischwasser- und Entsorgungsstation am Wohnmobilstellplatz Engelsgarten. Der Audit muss solche Mehrfachobjekte künftig räumlich clustern. |
| BWT-Bierwiesenteich Pfaffroda | V/E vorhanden, Zugang unklar | Korrektur gegenüber dem ersten Schnellcheck: Die Betreiberseite bestätigt Frischwasser, Kassettenentleerung und Grauwasser-Bodeneinlass. PiNCAMP führt gleichzeitig „keine vollständige V/E-Station“; für die Existenz der genannten Komponenten hat die Betreiberquelle Vorrang. Nicht geklärt ist, ob reine Durchreise-V/E ohne Campingaufenthalt erlaubt ist. |
| Grabow, Stadthafen | bereits vorhanden | Kein neuer Standort; OSM-Treffer entspricht dem vorhandenen Stadthafen-Eintrag. |
| Wittstock/Dosse, Rheinsberger Straße | bereits vorhanden | Kein neuer Standort; die Stadt bestätigt dort Frischwasser sowie Grau- und Chemie-WC-Entsorgung. |

## Primärquellen

- NaturTherme Templin – Wohnmobilstellplatz, Ausstattung/Preise: https://www.naturthermetemplin.de/wohnmobilstellplatz/ausstattung und https://www.naturthermetemplin.de/wohnmobilstellplatz/preise
- Gemeinde Rüdersdorf – Camping / aktuelle Störung: https://www.ruedersdorf.de/freizeit-tourismus/ruedersdorf-erleben/camping/
- Gemeinde Rüdersdorf – öffentliche Toiletten / Entsorgung: https://www.ruedersdorf.de/freizeit-tourismus/ruedersdorf-erleben/oeffentliche-toiletten/
- SteinTherme Bad Belzig – Reisemobilstellplatz: https://www.steintherme.de/reisemobilstellplatz/reisemobilstellplatz.php
- Stadt Hoyerswerda – Wohnmobilstellplatz Gondelteich: https://www.hoyerswerda.de/2020/07/17/einweihung-wohnmobilstellplatz-am-gondelteich-lausitzbad-hoyerswerda/
- Waldgasthof Bad Einsiedel – Camper/Caravan: https://waldgasthof-bad-einsiedel.de/freizeit-in-und-um-seiffen/camper-caravan-stellplatz-seiffen/
- Stadt Zerbst/Anhalt – Wohnmobilstellplatz: https://www.stadt-zerbst.de/de/zerbstanhalt-von-a-bis-z.html
- Landeshauptstadt Magdeburg – Petriförder Adressseite: https://www.magdeburg.de/B%C3%BCrger-Stadt/System/Adressen/Wohnmobilstellplatz-Petrif%C3%B6rder.php?FID=557.145.1&ModID=9
- Landeshauptstadt Magdeburg – Meldung zur V/E-Station 2024: https://www.magdeburg.de/B%C3%BCrger-Stadt/Ver-und-Entsorgungsstation-des-Wohnmobilstellplatzes-am-Petrif%C3%B6rder-erneuert.php?FID=698.31569.1&ModID=7&NavID=37.367&object=tx%2C698.6.1&sNavID=1.100
- Stadt Mühlhausen – Engelsgarten: https://www.muehlhausen.de/tourismus/uebernachten/weitere-uebernachtungsmoeglichkeiten/wohnmobilstellplatz-am-engelsgarten/
- BWT Bierwiesenteich Pfaffroda – Camping/V&E: https://www.bwt-pfaffroda.de/camping/

## Konsequenzen für den Datenbestand

1. Keine der als „bereits vorhanden“ erkannten Stationen erneut importieren.
2. Rüdersdorf im Bestand aktualisieren: Trinkwasser derzeit nicht verfügbar, Abwasserentsorgung weiterhin möglich; Status wegen Vandalismus zeitlich befristet kennzeichnen.
3. Magdeburg Petriförder als „aktuell zu prüfen“ markieren, weil zwei offizielle Stadtseiten widersprüchliche Angaben enthalten.
4. NaturTherme Templin und BWT Pfaffroda nicht automatisch als frei nutzbare Durchreise-V/E einstufen; zunächst klären, ob reine V/E-Nutzung ohne Übernachtung erlaubt ist.
5. Den OSM-Audit um räumliches Clustering ergänzen, damit mehrere OSM-Objekte derselben physischen Anlage (z. B. Mühlhausen Engelsgarten) nicht als mehrere Kandidaten gezählt werden.
