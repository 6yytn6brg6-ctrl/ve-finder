# V/E Finder – Quellen- und Prüfstatus pro Station

Stand: 2026-08-22

## Ziel

Jede Station soll künftig nicht nur ihre V/E-Daten enthalten, sondern auch nachvollziehbar machen, woher die Angaben stammen, wann sie zuletzt geprüft wurden und wie belastbar sie sind. Altbestand bleibt funktionsfähig, wird aber ausdrücklich als noch nicht vollständig quellendokumentiert gekennzeichnet.

## Felder pro Station

```json
{
  "sources": [
    {
      "type": "municipality",
      "name": "Stadt / Gemeinde / Betreiber",
      "url": "https://…",
      "checked_at": "2026-08-22",
      "note": "Bestätigt Frischwasser und Entsorgung",
      "confirms": ["existence", "access", "water", "grey", "cassette", "price"]
    }
  ],
  "checked_at": "2026-08-22",
  "source_type": "official",
  "source_url": "https://…",
  "source_note": "Kurznotiz zur wichtigsten Quelle",
  "verification_status": "primary_confirmed"
}
```

## source_type

- `official` – Kommune, Stadt, Tourist-Information oder andere amtliche Stelle
- `operator` – Betreiber der Station / des Stellplatzes
- `manufacturer` – Hersteller/Betreiber der Entsorgungsanlage, z. B. CamperClean/SANI-STATION
- `osm` – OpenStreetMap als offene Vergleichs-/Fundquelle
- `community` – Wohnmobilportal oder Community-Hinweis; nicht allein ausreichend für eine endgültige Bestätigung
- `user` – eigener, direkt auf dem Gerät angelegter Eintrag
- `legacy` – Altbestand mit alter Quellenangabe
- `legacy_untracked` – Altbestand ohne nachvollziehbare Einzelquelle

## verification_status

- `legacy_untracked` – noch nicht neu geprüft
- `candidate` – Fundstelle, Bestätigung steht aus
- `primary_confirmed` – mindestens eine belastbare Primärquelle bestätigt den Eintrag
- `cross_checked` – mindestens zwei voneinander unabhängige Quellen stimmen überein
- `conflict` – Quellen widersprechen sich
- `temporarily_limited` – Station existiert, aktuell aber ganz oder teilweise eingeschränkt

## confirms

Eine Quelle soll möglichst angeben, was sie tatsächlich bestätigt. Zulässige Werte sind insbesondere:

- `existence`
- `access`
- `cassette`
- `grey`
- `water`
- `trash`
- `price`
- `opening_hours`
- `coordinates`
- `phone`

## Migrationsregel für die 461 Altstationen

Beim Laden werden vorhandene Alt-Felder `source` und `lastChecked` in das neue Modell gespiegelt. Fehlt eine belastbare Einzelquelle, erhält die Station `verification_status=legacy_untracked`. Dadurch wird kein Altbestand fälschlich als neu verifiziert dargestellt.

Neue bzw. künftig neu geprüfte Stationen sollen die Quelleninformationen direkt vollständig erhalten. Die alten Felder `source` und `lastChecked` bleiben vorerst aus Kompatibilitätsgründen bestehen.
