#!/usr/bin/env python3
"""Apply the first verified results of the multilingual semantic source audit."""

from __future__ import annotations

import base64
import gzip
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
CHECKED = "2026-08-23"


def source(kind: str, name: str, url: str, note: str, confirms: list[str]) -> dict:
    return {
        "type": kind,
        "name": name,
        "url": url,
        "checked_at": CHECKED,
        "note": note,
        "confirms": confirms,
    }


UPDATES = {
    "ve-339": {
        "status": "BESTÄTIGT: Durchreisende",
        "cassette": "ja",
        "grey": "ja",
        "water": "ja",
        "trash": "?",
        "price": "6 EUR für Parken bis 5 Stunden inklusive Dienste",
        "source": "Camping-Car Park + Stadt Auerbach + BORDATLAS, geprüft 2026",
        "sourceUrl": "https://www.campingcarpark.com/de_DE/wohnmobilaufenthalt/sachsen/vogtlandkreis/Auerbach",
        "note": (
            "Der Betreiber bietet ausdrücklich den Kurzzeittarif 'Parken 5h + Dienste' für 6 EUR. "
            "Die Stadt bestätigt Wasser- und Abwasserversorgung; BORDATLAS bestätigt die Kassette."
        ),
        "lat": 50.476770602237,
        "lon": 12.428520999826,
        "coordinateQuality": "exact",
        "color": "Grün",
        "sources": [
            source(
                "operator",
                "Camping-Car Park – Auerbach",
                "https://www.campingcarpark.com/de_DE/wohnmobilaufenthalt/sachsen/vogtlandkreis/Auerbach",
                "Betreiber nennt den Tarif 'Parken 5h + Dienste' für 6 EUR und exakte Koordinaten.",
                ["existence", "access", "price", "coordinates"],
            ),
            source(
                "municipal",
                "Stadt Auerbach – Wohnmobilstellplatz Beerheide",
                "https://www.stadt-auerbach.de/news/1/1091295/nachrichten/er%C3%B6ffnet-beerheides-neuer-wohnmobil-stellplatz.html",
                "Stadt bestätigt ganzjährigen Betrieb sowie Wasser- und Abwasserversorgung.",
                ["existence", "grey", "water", "address"],
            ),
            source(
                "editorial",
                "BORDATLAS 2026",
                "https://www.bordatlas.de/entsorgungsstationen/",
                "Bestätigt Entsorgungsstation und Kassettentoiletten-Entsorgung.",
                ["cassette", "grey"],
            ),
        ],
        "source_type": "operator",
        "source_url": "https://www.campingcarpark.com/de_DE/wohnmobilaufenthalt/sachsen/vogtlandkreis/Auerbach",
        "source_note": "Eigenständiger Kurzzeittarif bestätigt V/E-Nutzung ohne Übernachtung.",
        "verification_status": "cross_checked",
        "confirms": ["existence", "access", "cassette", "grey", "water", "price", "coordinates"],
        "discovered_via": "französische Betreiber-Domain; semantisches Signal 'Parken 5h + Dienste'",
        "source_owner_country": "FR/DE",
        "source_dependency": "operator plus independent municipal/editorial confirmation",
        "primary_confirmation": "operator short-service tariff",
    },
    "ve-351": {
        "name": "Coswig/Anhalt, Elbstraße 19, Wohnmobil-Parkplatz an der Elbe",
        "status": "BESTÄTIGT: Durchreisende (saisonal)",
        "type": "Stellplatz / separate Durchreise-V/E",
        "cassette": "ja",
        "grey": "ja",
        "water": "ja",
        "trash": "?",
        "price": "V/E für Durchreisende 5 EUR",
        "phone": "+49 176 10354241",
        "source": "promobil + park4night, geprüft 2026",
        "sourceUrl": "https://www.promobil.de/stellplatz/wohnmobil-parkplatz-an-der-elbe-6695889100fb6a000830bcbe.html",
        "note": (
            "promobil bepreist vollständige V/E für Durchreisende mit 5 EUR. park4night bestätigt "
            "die separate Station und aktuelle reine V/E-Nutzungen. Zur Saison besteht ein "
            "Quellenunterschied: promobil nennt keine Winter-V/E, park4night ganzjährigen Betrieb; "
            "Öffnungszeit laut park4night 08:00 bis 20:00 Uhr."
        ),
        "lat": 51.8816,
        "lon": 12.4363,
        "coordinateQuality": "exact",
        "color": "Grün",
        "sources": [
            source(
                "editorial",
                "promobil – Wohnmobil-Parkplatz an der Elbe",
                "https://www.promobil.de/stellplatz/wohnmobil-parkplatz-an-der-elbe-6695889100fb6a000830bcbe.html",
                "Bestätigt Wasser, Grauwasser, Kassette und V/E für Durchreisende für 5 EUR.",
                ["existence", "access", "cassette", "grey", "water", "price", "coordinates", "phone"],
            ),
            source(
                "community",
                "park4night – Ab der Elbe",
                "https://park4night.com/de/place/590592",
                "Separate V/E, 5 EUR, 08:00–20:00 Uhr; aktuelle Berichte bestätigen reine Entsorgung.",
                ["existence", "access", "cassette", "grey", "water", "price", "coordinates", "opening_hours"],
            ),
        ],
        "source_type": "editorial",
        "source_url": "https://www.promobil.de/stellplatz/wohnmobil-parkplatz-an-der-elbe-6695889100fb6a000830bcbe.html",
        "source_note": (
            "Redaktioneller Durchreise-Tarif und aktuelle Community-Nutzung stimmen überein; "
            "die Winterverfügbarkeit bleibt wegen abweichender Quellenangaben offen."
        ),
        "verification_status": "cross_checked",
        "confirms": ["existence", "access", "cassette", "grey", "water", "price", "phone", "coordinates"],
        "discovered_via": "kategorieübergreifender semantischer Park4Night-/promobil-Abgleich",
        "source_owner_country": "DE/FR",
        "source_dependency": "independent editorial and community confirmation",
        "primary_confirmation": "editorial explicit through-service tariff",
    },
}


def load_stations() -> tuple[list[dict], list[Path]]:
    parts = sorted(DATA_DIR.glob("stations-461.part*.b64"))
    payload = "".join(part.read_text(encoding="utf-8").strip() for part in parts)
    return json.loads(gzip.decompress(base64.b64decode(payload))), parts


def write_stations(stations: list[dict], parts: list[Path]) -> None:
    serialized = json.dumps(stations, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    encoded = base64.b64encode(gzip.compress(serialized, mtime=0)).decode("ascii")
    width = (len(encoded) + len(parts) - 1) // len(parts)
    for index, part in enumerate(parts):
        part.write_text(encoded[index * width : (index + 1) * width] + "\n", encoding="utf-8")


def main() -> None:
    stations, parts = load_stations()
    if len(stations) != 493:
        raise RuntimeError(f"Expected 493 stations, got {len(stations)}")
    by_id = {item["id"]: item for item in stations}
    for station_id, changes in UPDATES.items():
        if station_id not in by_id:
            raise RuntimeError(f"Missing station {station_id}")
        by_id[station_id].update(changes)
        by_id[station_id]["lastChecked"] = CHECKED
        by_id[station_id]["checked_at"] = CHECKED
    write_stations(stations, parts)
    print("Updated ve-339 and ve-351 from semantic multilingual source evidence")


if __name__ == "__main__":
    main()
