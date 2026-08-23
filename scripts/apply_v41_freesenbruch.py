#!/usr/bin/env python3
"""Add the verified through-traveller V/E at Camping Am Freesenbruch."""

from __future__ import annotations

import base64
import gzip
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
CHECKED = "2026-08-23"


def source_record(kind: str, name: str, url: str, note: str, confirms: list[str]) -> dict:
    return {
        "type": kind,
        "name": name,
        "url": url,
        "checked_at": CHECKED,
        "note": note,
        "confirms": confirms,
    }


FREESENBRUCH = {
    "id": "ve-493",
    "state": "Mecklenburg-Vorpommern",
    "postal": "18374",
    "name": "Zingst, Am Bahndamm 1, Campingplatz Am Freesenbruch",
    "status": "BESTÄTIGT: Durchreisende",
    "type": "Campingplatz / Durchreise-V/E",
    "cassette": "ja",
    "grey": "ja",
    "water": "ja",
    "trash": "?",
    "price": "Gebühr vor Ort; Preis für reine V/E nicht veröffentlicht",
    "phone": "+49 38232 15786",
    "source": "Betreiber + TopPlatz + park4night + PiNCAMP, geprüft 2026",
    "note": (
        "Vollständige V/E ist durch Betreiber und Fachquellen bestätigt. "
        "park4night nennt die Nutzung für Wohnmobile auf der Durchreise ausdrücklich; "
        "TopPlatz verortet die V/E-Station vor der Einfahrt. Preis für reine V/E vor Ort prüfen."
    ),
    "sourceUrl": "https://www.camping-zingst.de/de/campingplatz/der-campingplatz",
    "lat": 54.4406,
    "lon": 12.6606,
    "coordinateQuality": "exact",
    "color": "Grün",
    "lastChecked": CHECKED,
    "sources": [
        source_record(
            "operator",
            "Campingplatz Am Freesenbruch",
            "https://www.camping-zingst.de/de/campingplatz/der-campingplatz",
            "Betreiber bestätigt V/E-Servicestation, CamperClean, Adresse und Kontakt.",
            ["existence", "cassette", "grey", "water", "address", "phone"],
        ),
        source_record(
            "editorial",
            "TopPlatz – Reisemobilhafen Am Freesenbruch",
            "https://top-platz.de/zingst-reisemobilhafen-am-freesenbruch/",
            "Bestätigt V/E-Station vor der Einfahrt, CamperClean, ganzjährigen Betrieb und Lage.",
            ["existence", "access", "cassette", "coordinates"],
        ),
        source_record(
            "community",
            "park4night – Campingplatz Am Freesenbruch",
            "https://park4night.com/de/place/122620",
            "Nennt V/E für Wohnmobile auf der Durchreise ausdrücklich und führt alle V/E-Dienste.",
            ["access", "cassette", "grey", "water", "coordinates"],
        ),
        source_record(
            "editorial",
            "PiNCAMP – Camping Am Freesenbruch",
            "https://www.pincamp.de/campingplaetze/camping-am-freesenbruch",
            "Bestätigt vollständige V/E mit Kassette, Abwasser/Fäkalien und Frischwasser.",
            ["cassette", "grey", "water"],
        ),
    ],
    "checked_at": CHECKED,
    "source_type": "operator",
    "source_url": "https://www.camping-zingst.de/de/campingplatz/der-campingplatz",
    "source_note": (
        "Betreiber bestätigt die Anlage; unabhängige Fach- und Communityquellen bestätigen "
        "Leistungen, Lage vor der Einfahrt und Nutzung durch Durchreisende."
    ),
    "verification_status": "cross_checked",
    "confirms": [
        "existence",
        "access",
        "cassette",
        "grey",
        "water",
        "address",
        "phone",
        "coordinates",
    ],
    "discovered_via": "Nutzerfund in park4night; Campingplatz-Kategorielücke im Quellen-Audit",
    "source_owner_country": "DE",
    "source_dependency": "operator plus independent editorial and community confirmation",
    "primary_confirmation": "operator service plus explicit community access confirmation",
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
    by_id = {item["id"]: item for item in stations}

    if len(stations) == 492 and "ve-493" not in by_id:
        stations.append(FREESENBRUCH)
    elif len(stations) == 493 and by_id.get("ve-493", {}).get("name") == FREESENBRUCH["name"]:
        stations = [FREESENBRUCH if item["id"] == "ve-493" else item for item in stations]
    else:
        raise RuntimeError(f"Expected 492-station base or v4.1 output, got {len(stations)} stations")

    if len(stations) != 493 or len({item["id"] for item in stations}) != 493:
        raise RuntimeError("Invalid v4.1 station set")

    write_stations(stations, parts)
    print("Wrote 493 stations: added ve-493 Campingplatz Am Freesenbruch")


if __name__ == "__main__":
    main()
