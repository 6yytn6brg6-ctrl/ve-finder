#!/usr/bin/env python3
"""Apply the reproducible semantic source sweep for the six eastern states."""

from __future__ import annotations

import base64
import gzip
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
CANDIDATES = ROOT / "docs" / "semantic-source-sweep-east-2026-08-23.json"
CHECKED = "2026-08-23"
EAST_STATES = {
    "Berlin",
    "Brandenburg",
    "Mecklenburg-Vorpommern",
    "Sachsen",
    "Sachsen-Anhalt",
    "Thüringen",
}

# These five records predate structured source URLs or still have postcode-level
# coordinates. They are the same physical locations and must not be duplicated.
KNOWN_EXISTING = {
    "Wohnmobil-Oase-Berlin in Berlin": "ve-5",
    "Wohnmobilstellplatz an der Stadtmarina in Brandenburg an der Havel": "ve-66",
    "Wohnmobilstellplatz Leipzig Melinenburg in Leipzig": "ve-265",
    "Wohnmobilstellplatz am Sportbootzentrum Ziegelsee in Schwerin": "ve-205",
    "Wohnmobilstellplatz Schwedenhof/Alter Stall in Gallin-Kuppentin": "ve-154",
    "Rosenstädter Wohnmobiloase in Sangerhausen": "ve-402",
}


def load_stations() -> tuple[list[dict], list[Path]]:
    parts = sorted(DATA_DIR.glob("stations-461.part*.b64"))
    if len(parts) != 5:
        raise RuntimeError(f"Expected five database chunks, got {len(parts)}")
    payload = "".join(part.read_text(encoding="utf-8").strip() for part in parts)
    return json.loads(gzip.decompress(base64.b64decode(payload))), parts


def write_stations(stations: list[dict], parts: list[Path]) -> None:
    serialized = json.dumps(stations, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    encoded = base64.b64encode(gzip.compress(serialized, mtime=0)).decode("ascii")
    width = (len(encoded) + len(parts) - 1) // len(parts)
    for index, part in enumerate(parts):
        part.write_text(encoded[index * width : (index + 1) * width] + "\n", encoding="utf-8")


def source_urls(station: dict) -> set[str]:
    urls = {station.get("sourceUrl"), station.get("source_url")}
    urls.update(item.get("url") for item in station.get("sources", []))
    return {url for url in urls if url}


def source_type(url: str) -> str:
    if "promobil.de" in url or "stellplatzfuehrer.de" in url:
        return "editorial"
    return "editorial"


def source_entry(candidate: dict) -> dict:
    season = candidate.get("season", "nicht angegeben")
    note = (
        f"{candidate['access']}. Preisangabe: {candidate['price']}. "
        f"Saison/Winter: {season} / {candidate.get('winter', 'nicht angegeben')}."
    )
    return {
        "type": source_type(candidate["url"]),
        "name": f"{candidate['source']} – {candidate['title']}",
        "url": candidate["url"],
        "checked_at": CHECKED,
        "note": note,
        "confirms": [
            "existence",
            "access",
            "coordinates",
            "cassette",
            "grey",
            "water",
            "price",
        ],
    }


def seasonal(candidate: dict) -> bool:
    winter = str(candidate.get("winter", "")).lower()
    season = str(candidate.get("season", "")).lower()
    return winter == "nein" or (
        season not in {"", "nicht angegeben", "ganzjährig geöffnet", "ganzjährig"}
        and "ganzjährig" not in season
    )


def station_type(candidate: dict) -> str:
    title = candidate["title"].lower()
    if "camping" in title or "naturcamp" in title:
        return "Campingplatz / Durchreise-V/E"
    return "Stellplatz / Durchreise-V/E"


def evidence_note(candidate: dict) -> str:
    note = f"{candidate['access']}. Preis: {candidate['price']}."
    season = candidate.get("season", "nicht angegeben")
    winter = candidate.get("winter", "nicht angegeben")
    if season != "nicht angegeben" or winter != "nicht angegeben":
        note += f" Saison: {season}; Winter-V/E: {winter}."
    return note


def merge_candidate(station: dict, candidate: dict) -> None:
    entry = source_entry(candidate)
    sources = list(station.get("sources", []))
    existing = next((item for item in sources if item.get("url") == entry["url"]), None)
    if existing:
        existing.update(entry)
    else:
        sources.append(entry)

    station.update(
        {
            "status": "BESTÄTIGT: Durchreisende (saisonal)" if seasonal(candidate) else "BESTÄTIGT: Durchreisende",
            "type": station_type(candidate),
            "cassette": candidate["cassette"],
            "grey": candidate["grey"],
            "water": candidate["water"],
            "price": candidate["price"],
            "source": f"{candidate['source']}, geprüft 2026",
            "sourceUrl": candidate["url"],
            "note": evidence_note(candidate),
            "lat": candidate["lat"],
            "lon": candidate["lon"],
            "coordinateQuality": "exact",
            "color": "Grün",
            "lastChecked": CHECKED,
            "sources": sources,
            "checked_at": CHECKED,
            "source_type": entry["type"],
            "source_url": candidate["url"],
            "source_note": evidence_note(candidate),
            "verification_status": "editorial_confirmed",
            "confirms": entry["confirms"],
            "discovered_via": "vollständiger semantischer Quellenlauf für die sechs ostdeutschen Bundesländer",
            "source_owner_country": "DE",
            "source_dependency": "single specialist source; operator or municipal cross-check remains desirable",
            "primary_confirmation": "structured specialist field for non-overnight V/E access",
        }
    )


def new_station(station_id: str, candidate: dict) -> dict:
    station = {
        "id": station_id,
        "state": candidate["state"],
        "postal": candidate["postal"],
        "name": f"{candidate['title']}, {candidate['address']}",
        "trash": "?",
        "phone": "",
    }
    merge_candidate(station, candidate)
    return station


def main() -> None:
    candidates = json.loads(CANDIDATES.read_text(encoding="utf-8"))
    if len(candidates) != 40:
        raise RuntimeError(f"Expected 40 eastern positive source records, got {len(candidates)}")
    if {item["state"] for item in candidates} - EAST_STATES:
        raise RuntimeError("Candidate file contains a state outside the agreed eastern scope")

    stations, parts = load_stations()
    if len(stations) not in {493, 498}:
        raise RuntimeError(f"Expected 493 or 498 stations, got {len(stations)}")

    by_id = {item["id"]: item for item in stations}
    by_url = {url: item for item in stations for url in source_urls(item)}
    next_id = max(int(item["id"].split("-")[1]) for item in stations) + 1
    updated = 0
    added = 0

    for candidate in candidates:
        station = by_url.get(candidate["url"])
        if not station and candidate["title"] in KNOWN_EXISTING:
            station = by_id[KNOWN_EXISTING[candidate["title"]]]
        if station:
            merge_candidate(station, candidate)
            by_url[candidate["url"]] = station
            updated += 1
            continue

        station = new_station(f"ve-{next_id}", candidate)
        next_id += 1
        stations.append(station)
        by_id[station["id"]] = station
        by_url[candidate["url"]] = station
        added += 1

    if len(stations) != 498:
        raise RuntimeError(f"Expected 498 stations after deduplication, got {len(stations)}")
    if len({item["id"] for item in stations}) != len(stations):
        raise RuntimeError("Duplicate station IDs after semantic sweep")

    write_stations(stations, parts)
    print(f"Semantic eastern-state sweep complete: {updated} updated, {added} added, {len(stations)} total")


if __name__ == "__main__":
    main()
