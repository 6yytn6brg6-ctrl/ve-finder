#!/usr/bin/env python3
"""Compare V/E Finder's 461-station dataset with OpenStreetMap dump-station tags.

Outputs are candidates for manual verification, not an automatic import.
Only the six federal states currently covered by the 461-entry dataset are queried.
"""

from __future__ import annotations

import argparse
import base64
import csv
import difflib
import gzip
import json
import math
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

STATES = {
    "DE-BE": "Berlin",
    "DE-BB": "Brandenburg",
    "DE-MV": "Mecklenburg-Vorpommern",
    "DE-SN": "Sachsen",
    "DE-ST": "Sachsen-Anhalt",
    "DE-TH": "Thüringen",
}

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]


def load_vefinder_database(repo_root: Path) -> list[dict]:
    parts = sorted((repo_root / "data").glob("stations-461.part*.b64"))
    if not parts:
        raise RuntimeError("Keine stations-461.part*.b64 Dateien gefunden")

    encoded = "".join(p.read_text(encoding="utf-8") for p in parts)
    compressed = base64.b64decode(re.sub(r"\s+", "", encoded))
    data = json.loads(gzip.decompress(compressed).decode("utf-8"))
    if not isinstance(data, list) or len(data) != 461:
        raise RuntimeError(f"Unerwarteter Datenbestand: {len(data) if isinstance(data, list) else 'kein Array'}")
    return data


def overpass_query(iso_code: str) -> str:
    return f'''[out:json][timeout:120];
area["ISO3166-2"="{iso_code}"][boundary=administrative]->.searchArea;
(
  nwr["amenity"="sanitary_dump_station"](area.searchArea);
  nwr["sanitary_dump_station"~"^(yes|public|customers)$"](area.searchArea);
);
out center tags;'''


def fetch_overpass(query: str, attempts: int = 4) -> dict:
    body = urllib.parse.urlencode({"data": query}).encode("utf-8")
    last_error: Exception | None = None

    for attempt in range(attempts):
        endpoint = OVERPASS_ENDPOINTS[attempt % len(OVERPASS_ENDPOINTS)]
        req = urllib.request.Request(
            endpoint,
            data=body,
            headers={
                "User-Agent": "VEFinder-OSM-Audit/1.0 (+https://github.com/6yytn6brg6-ctrl/ve-finder)",
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=150) as response:
                return json.load(response)
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as exc:
            last_error = exc
            wait = 4 * (attempt + 1)
            print(f"Overpass-Fehler über {endpoint}: {exc}; neuer Versuch in {wait}s")
            time.sleep(wait)

    raise RuntimeError(f"Overpass nach {attempts} Versuchen nicht erreichbar: {last_error}")


def element_coordinates(element: dict) -> tuple[float | None, float | None]:
    if "lat" in element and "lon" in element:
        return float(element["lat"]), float(element["lon"])
    center = element.get("center") or {}
    if "lat" in center and "lon" in center:
        return float(center["lat"]), float(center["lon"])
    return None, None


def normalize_name(value: str | None) -> str:
    value = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode("ascii")
    value = value.lower()
    value = re.sub(r"\b(wohnmobil|wohnmobilstellplatz|stellplatz|entsorgung|ver und entsorgung|v e station|ve station)\b", " ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return " ".join(value.split())


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0088
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def nearest_match(osm: dict, existing: list[dict]) -> tuple[dict | None, float | None, float]:
    lat, lon = osm["lat"], osm["lon"]
    best = None
    best_distance = None
    best_similarity = 0.0
    osm_name = normalize_name(osm.get("name"))

    for station in existing:
        try:
            slat = float(station.get("lat"))
            slon = float(station.get("lon"))
        except (TypeError, ValueError):
            continue
        distance = haversine_km(lat, lon, slat, slon)
        if best_distance is None or distance < best_distance:
            best = station
            best_distance = distance
            best_similarity = difflib.SequenceMatcher(None, osm_name, normalize_name(station.get("name"))).ratio() if osm_name else 0.0

    return best, best_distance, best_similarity


def classify(distance_km: float | None, similarity: float) -> str:
    if distance_km is None:
        return "missing_candidate"
    if distance_km <= 0.30:
        return "strong_match"
    if distance_km <= 1.00 and similarity >= 0.60:
        return "strong_match"
    if distance_km <= 1.50:
        return "possible_match"
    return "missing_candidate"


def tag(tags: dict, *keys: str) -> str:
    for key in keys:
        value = tags.get(key)
        if value not in (None, ""):
            return str(value)
    return ""


def address(tags: dict) -> str:
    parts = [
        tag(tags, "addr:street"),
        tag(tags, "addr:housenumber"),
        tag(tags, "addr:postcode"),
        tag(tags, "addr:city"),
    ]
    return " ".join(x for x in parts if x)


def osm_record(element: dict, state_code: str, state_name: str) -> dict | None:
    lat, lon = element_coordinates(element)
    if lat is None or lon is None:
        return None
    tags = element.get("tags") or {}
    return {
        "state_code": state_code,
        "state": state_name,
        "osm_type": element.get("type", ""),
        "osm_id": element.get("id", ""),
        "lat": lat,
        "lon": lon,
        "name": tag(tags, "name", "operator", "description") or "Unbenannte OSM-V/E-Station",
        "operator": tag(tags, "operator"),
        "amenity": tag(tags, "amenity"),
        "sanitary_dump_station": tag(tags, "sanitary_dump_station"),
        "chemical_toilet": tag(tags, "sanitary_dump_station:chemical_toilet", "waste_disposal:chemical_toilet"),
        "grey_water": tag(tags, "sanitary_dump_station:grey_water", "waste_disposal:grey_water"),
        "water": tag(tags, "water_point", "drinking_water"),
        "access": tag(tags, "access", "sanitary_dump_station:access"),
        "fee": tag(tags, "fee", "sanitary_dump_station:fee"),
        "opening_hours": tag(tags, "opening_hours"),
        "website": tag(tags, "website", "contact:website"),
        "phone": tag(tags, "phone", "contact:phone"),
        "address": address(tags),
        "source": tag(tags, "source"),
        "osm_url": f"https://www.openstreetmap.org/{element.get('type')}/{element.get('id')}",
        "all_tags": tags,
    }


def write_outputs(output_dir: Path, existing: list[dict], osm_records: list[dict]) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    existing_by_state = defaultdict(list)
    for station in existing:
        existing_by_state[str(station.get("state") or "")].append(station)

    rows = []
    counts = Counter()
    state_counts = defaultdict(Counter)

    for record in osm_records:
        pool = existing_by_state.get(record["state"], existing)
        match, distance, similarity = nearest_match(record, pool)
        status = classify(distance, similarity)
        counts[status] += 1
        state_counts[record["state"]][status] += 1
        state_counts[record["state"]]["osm_total"] += 1

        rows.append({
            **{k: v for k, v in record.items() if k != "all_tags"},
            "audit_status": status,
            "nearest_ve_id": match.get("id", "") if match else "",
            "nearest_ve_name": match.get("name", "") if match else "",
            "nearest_distance_km": f"{distance:.3f}" if distance is not None else "",
            "name_similarity": f"{similarity:.3f}",
        })

    rows.sort(key=lambda r: (r["audit_status"] != "missing_candidate", r["state"], r["name"]))

    fieldnames = [
        "audit_status", "state", "state_code", "name", "operator", "lat", "lon",
        "amenity", "sanitary_dump_station", "chemical_toilet", "grey_water", "water",
        "access", "fee", "opening_hours", "website", "phone", "address", "source",
        "osm_type", "osm_id", "osm_url", "nearest_ve_id", "nearest_ve_name",
        "nearest_distance_km", "name_similarity",
    ]
    with (output_dir / "osm-candidates.csv").open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    raw = [{k: v for k, v in record.items()} for record in osm_records]
    (output_dir / "osm-raw.json").write_text(json.dumps(raw, ensure_ascii=False, indent=2), encoding="utf-8")

    missing = [r for r in rows if r["audit_status"] == "missing_candidate"]
    summary_lines = [
        "# OSM-Abgleich V/E Finder",
        "",
        f"- V/E-Finder-Bestand: **{len(existing)}** Stationen",
        f"- OSM-Objekte in den sechs geprüften Bundesländern: **{len(osm_records)}**",
        f"- starker räumlicher/namensbasierter Treffer: **{counts['strong_match']}**",
        f"- möglicher Treffer (manuell prüfen): **{counts['possible_match']}**",
        f"- wahrscheinlich noch nicht im V/E Finder: **{counts['missing_candidate']}**",
        "",
        "## Nach Bundesland",
        "",
        "| Bundesland | OSM gesamt | stark | möglich | fehlt wahrscheinlich |",
        "|---|---:|---:|---:|---:|",
    ]
    for state in STATES.values():
        c = state_counts[state]
        summary_lines.append(
            f"| {state} | {c['osm_total']} | {c['strong_match']} | {c['possible_match']} | {c['missing_candidate']} |"
        )

    summary_lines += [
        "",
        "## Erste fehlende Kandidaten",
        "",
        "Diese Liste ist **noch kein Import**. Zugang und Leistungen müssen über Betreiber, Kommune oder Tourismusquelle bestätigt werden.",
        "",
    ]
    for row in missing[:100]:
        detail = ", ".join(x for x in [row["address"], f"Access={row['access']}" if row["access"] else "", f"Fee={row['fee']}" if row["fee"] else ""] if x)
        summary_lines.append(f"- **{row['state']} – {row['name']}**" + (f" ({detail})" if detail else "") + f" – {row['osm_url']}")

    if len(missing) > 100:
        summary_lines.append(f"- … weitere {len(missing) - 100} Kandidaten siehe CSV")

    (output_dir / "osm-audit-summary.md").write_text("\n".join(summary_lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--output", default="audit-output")
    args = parser.parse_args()

    root = Path(args.repo_root).resolve()
    existing = load_vefinder_database(root)
    osm_records = []
    seen = set()

    for iso_code, state_name in STATES.items():
        print(f"OSM-Abfrage: {state_name} ({iso_code})")
        payload = fetch_overpass(overpass_query(iso_code))
        state_total = 0
        for element in payload.get("elements", []):
            key = (element.get("type"), element.get("id"))
            if key in seen:
                continue
            record = osm_record(element, iso_code, state_name)
            if not record:
                continue
            seen.add(key)
            osm_records.append(record)
            state_total += 1
        print(f"  {state_total} eindeutige OSM-Objekte")
        time.sleep(2)

    write_outputs(Path(args.output), existing, osm_records)
    print(f"Fertig: {len(osm_records)} OSM-Objekte verglichen. Ergebnisse in {args.output}/")


if __name__ == "__main__":
    main()
