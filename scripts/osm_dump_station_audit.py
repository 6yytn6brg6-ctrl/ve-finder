#!/usr/bin/env python3
"""Compare V/E Finder's current station dataset with OpenStreetMap dump-station tags.

The output is a verification queue, not an automatic import.  OSM contains many
campground/marina/customer-only services; those are deliberately separated from
standalone/public-looking candidates.
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

EXPECTED_STATION_COUNT = 466

STATE_ALIASES = {
    "Berlin": {"berlin", "be", "de-be"},
    "Brandenburg": {"brandenburg", "bb", "de-bb"},
    "Mecklenburg-Vorpommern": {"mecklenburg-vorpommern", "mv", "de-mv"},
    "Sachsen": {"sachsen", "sn", "de-sn"},
    "Sachsen-Anhalt": {"sachsen-anhalt", "st", "de-st"},
    "Thüringen": {"thüringen", "thueringen", "th", "de-th"},
}

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

RESTRICTED_ACCESS = {"customers", "customer", "private", "permit", "members", "no"}
PUBLIC_ACCESS = {"yes", "public", "permissive"}
SITE_TOURISM = {"camp_site", "caravan_site", "camp_pitch"}


def load_vefinder_database(repo_root: Path) -> list[dict]:
    parts = sorted((repo_root / "data").glob("stations-461.part*.b64"))
    if not parts:
        raise RuntimeError("Keine stations-461.part*.b64 Dateien gefunden")

    encoded = "".join(p.read_text(encoding="utf-8") for p in parts)
    compressed = base64.b64decode(re.sub(r"\s+", "", encoded))
    data = json.loads(gzip.decompress(compressed).decode("utf-8"))
    if not isinstance(data, list) or len(data) != EXPECTED_STATION_COUNT:
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
                "User-Agent": "VEFinder-OSM-Audit/1.1 (+https://github.com/6yytn6brg6-ctrl/ve-finder)",
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
    value = re.sub(
        r"\b(wohnmobil|wohnmobilstellplatz|wohnmobilpark|reisemobil|reisemobilstellplatz|"
        r"stellplatz|caravanstellplatz|entsorgung|ver und entsorgung|v e station|ve station)\b",
        " ",
        value,
    )
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return " ".join(value.split())


def normalize_state(value: str | None) -> str:
    return str(value or "").strip().lower().replace("ü", "ue")


def state_pool(existing: list[dict], state_name: str) -> list[dict]:
    aliases = {normalize_state(v) for v in STATE_ALIASES[state_name]}
    matches = [s for s in existing if normalize_state(s.get("state")) in aliases]
    return matches or existing


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0088
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def best_match(osm: dict, existing: list[dict]) -> tuple[dict | None, float | None, float, bool]:
    """Prefer close coordinates, but allow strong name/postcode matches for PLZ-centroid legacy data."""
    lat, lon = osm["lat"], osm["lon"]
    osm_name = normalize_name(osm.get("name"))
    osm_postcode = str(osm.get("postcode") or "").strip()

    best = None
    best_score = float("-inf")
    best_distance = None
    best_similarity = 0.0
    best_postcode = False

    for station in existing:
        try:
            slat = float(station.get("lat"))
            slon = float(station.get("lon"))
        except (TypeError, ValueError):
            continue

        distance = haversine_km(lat, lon, slat, slon)
        similarity = (
            difflib.SequenceMatcher(None, osm_name, normalize_name(station.get("name"))).ratio()
            if osm_name else 0.0
        )
        postcode_match = bool(osm_postcode and osm_postcode == str(station.get("postal") or "").strip())

        # Distance dominates nearby objects. Strong names/postcodes can rescue
        # legacy records whose coordinates are only at postcode-centroid level.
        score = -min(distance, 30.0)
        if distance <= 0.30:
            score += 120
        elif distance <= 1.50:
            score += 70
        elif distance <= 5.0:
            score += 20
        if similarity >= 0.85:
            score += 110
        elif similarity >= 0.75:
            score += 85
        elif similarity >= 0.60:
            score += 45
        elif similarity >= 0.45:
            score += 15
        if postcode_match:
            score += 75

        if score > best_score:
            best = station
            best_score = score
            best_distance = distance
            best_similarity = similarity
            best_postcode = postcode_match

    return best, best_distance, best_similarity, best_postcode


def classify_match(distance_km: float | None, similarity: float, postcode_match: bool) -> str:
    if distance_km is None:
        return "missing_candidate"
    if distance_km <= 0.30:
        return "strong_match"
    if similarity >= 0.78 and distance_km <= 20.0:
        return "strong_match"
    if postcode_match and (similarity >= 0.40 or distance_km <= 3.0):
        return "strong_match"
    if distance_km <= 1.50:
        return "possible_match"
    if similarity >= 0.60 and distance_km <= 20.0:
        return "possible_match"
    if postcode_match and distance_km <= 10.0:
        return "possible_match"
    return "missing_candidate"


def tag(tags: dict, *keys: str) -> str:
    for key in keys:
        value = tags.get(key)
        if value not in (None, ""):
            return str(value)
    return ""


def address(tags: dict) -> str:
    parts = [tag(tags, "addr:street"), tag(tags, "addr:housenumber"), tag(tags, "addr:postcode"), tag(tags, "addr:city")]
    return " ".join(x for x in parts if x)


def candidate_class(record: dict) -> str:
    access = str(record.get("access") or "").lower()
    sds = str(record.get("sanitary_dump_station") or "").lower()
    tourism = str(record.get("tourism") or "").lower()
    leisure = str(record.get("leisure") or "").lower()
    motorhome = str(record.get("motorhome") or "").lower()
    amenity = str(record.get("amenity") or "").lower()

    if motorhome == "no":
        return "not_for_motorhomes"
    if access in RESTRICTED_ACCESS or sds == "customers":
        return "restricted"
    if tourism in SITE_TOURISM and amenity != "sanitary_dump_station":
        return "site_service"
    if leisure == "marina" and amenity != "sanitary_dump_station":
        return "marina_service"
    if sds == "public" or access in PUBLIC_ACCESS:
        return "public_explicit"
    if amenity == "sanitary_dump_station":
        return "standalone_access_unknown"
    return "service_access_unknown"


def osm_record(element: dict, state_code: str, state_name: str) -> dict | None:
    lat, lon = element_coordinates(element)
    if lat is None or lon is None:
        return None
    tags = element.get("tags") or {}
    record = {
        "state_code": state_code,
        "state": state_name,
        "osm_type": element.get("type", ""),
        "osm_id": element.get("id", ""),
        "lat": lat,
        "lon": lon,
        "name": tag(tags, "name", "operator", "description") or "Unbenannte OSM-V/E-Station",
        "operator": tag(tags, "operator"),
        "postcode": tag(tags, "addr:postcode"),
        "amenity": tag(tags, "amenity"),
        "tourism": tag(tags, "tourism"),
        "leisure": tag(tags, "leisure"),
        "motorhome": tag(tags, "motorhome"),
        "caravans": tag(tags, "caravans"),
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
    record["candidate_class"] = candidate_class(record)
    return record


def write_outputs(output_dir: Path, existing: list[dict], osm_records: list[dict]) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    rows = []
    match_counts = Counter()
    class_counts = Counter()
    state_counts = defaultdict(Counter)

    for record in osm_records:
        pool = state_pool(existing, record["state"])
        match, distance, similarity, postcode_match = best_match(record, pool)
        status = classify_match(distance, similarity, postcode_match)
        match_counts[status] += 1
        class_counts[record["candidate_class"]] += 1
        state_counts[record["state"]]["osm_total"] += 1
        state_counts[record["state"]][status] += 1
        state_counts[record["state"]][record["candidate_class"]] += 1

        rows.append({
            **{k: v for k, v in record.items() if k != "all_tags"},
            "audit_status": status,
            "nearest_ve_id": match.get("id", "") if match else "",
            "nearest_ve_name": match.get("name", "") if match else "",
            "nearest_ve_postal": match.get("postal", "") if match else "",
            "nearest_distance_km": f"{distance:.3f}" if distance is not None else "",
            "name_similarity": f"{similarity:.3f}",
            "postcode_match": "yes" if postcode_match else "",
        })

    actionable_classes = {"public_explicit", "standalone_access_unknown", "service_access_unknown"}
    actionable_missing = [
        r for r in rows if r["audit_status"] == "missing_candidate" and r["candidate_class"] in actionable_classes
    ]

    priority = {"public_explicit": 0, "standalone_access_unknown": 1, "service_access_unknown": 2}
    rows.sort(key=lambda r: (
        r["audit_status"] != "missing_candidate",
        priority.get(r["candidate_class"], 9),
        r["state"],
        r["name"],
    ))
    actionable_missing.sort(key=lambda r: (priority.get(r["candidate_class"], 9), r["state"], r["name"]))

    fieldnames = [
        "audit_status", "candidate_class", "state", "state_code", "name", "operator", "postcode", "lat", "lon",
        "amenity", "tourism", "leisure", "motorhome", "caravans", "sanitary_dump_station",
        "chemical_toilet", "grey_water", "water", "access", "fee", "opening_hours", "website", "phone",
        "address", "source", "osm_type", "osm_id", "osm_url", "nearest_ve_id", "nearest_ve_name",
        "nearest_ve_postal", "nearest_distance_km", "name_similarity", "postcode_match",
    ]
    with (output_dir / "osm-candidates.csv").open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    with (output_dir / "osm-actionable-missing.csv").open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(actionable_missing)

    (output_dir / "osm-raw.json").write_text(json.dumps(osm_records, ensure_ascii=False, indent=2), encoding="utf-8")

    summary_lines = [
        "# OSM-Abgleich V/E Finder",
        "",
        f"- V/E-Finder-Bestand: **{len(existing)}** Stationen",
        f"- OSM-Objekte in den sechs geprüften Bundesländern: **{len(osm_records)}**",
        f"- starke Treffer gegen vorhandenen Bestand: **{match_counts['strong_match']}**",
        f"- mögliche Treffer (manuell prüfen): **{match_counts['possible_match']}**",
        f"- ohne ausreichenden Match: **{match_counts['missing_candidate']}**",
        f"- davon aktuell **prioritäre OSM-Neukandidaten** (öffentlich/standalone/Zugang noch zu klären): **{len(actionable_missing)}**",
        "",
        "Wichtig: Die Zahl 'ohne ausreichenden Match' ist keine Zahl fehlender öffentlicher V/E-Stationen. OSM enthält auch Campingplatz-, Marina- und Kundenanlagen. Außerdem besitzen einige Alt-Datensätze im V/E Finder nur PLZ-genaue Koordinaten.",
        "",
        "## OSM-Objekte nach Nutzbarkeit",
        "",
        "| Klasse | Anzahl | Bedeutung |",
        "|---|---:|---|",
        f"| public_explicit | {class_counts['public_explicit']} | Zugang in OSM ausdrücklich öffentlich/ja/permissive |",
        f"| standalone_access_unknown | {class_counts['standalone_access_unknown']} | eigene V/E-Station, Zugang muss geprüft werden |",
        f"| service_access_unknown | {class_counts['service_access_unknown']} | V/E als Eigenschaft eines sonstigen Objekts, Zugang unklar |",
        f"| site_service | {class_counts['site_service']} | Camping-/Caravanplatz-Service, nicht als frei öffentlich annehmen |",
        f"| marina_service | {class_counts['marina_service']} | Marina-/Hafen-Service, Wohnmobilzugang prüfen |",
        f"| restricted | {class_counts['restricted']} | customers/private/permit/members o. ä. |",
        f"| not_for_motorhomes | {class_counts['not_for_motorhomes']} | OSM weist motorhome=no aus |",
        "",
        "## Nach Bundesland",
        "",
        "| Bundesland | OSM gesamt | stark | möglich | prioritäre Neukandidaten |",
        "|---|---:|---:|---:|---:|",
    ]

    for state in STATES.values():
        c = state_counts[state]
        state_actionable = sum(
            1 for r in actionable_missing if r["state"] == state
        )
        summary_lines.append(f"| {state} | {c['osm_total']} | {c['strong_match']} | {c['possible_match']} | {state_actionable} |")

    summary_lines += [
        "",
        "## Erste prioritäre Neukandidaten",
        "",
        "Diese Liste ist **noch kein Import**. Jeder Kandidat wird anschließend über Betreiber, Kommune, Tourist-Information oder eine andere Primärquelle bestätigt.",
        "",
    ]
    for row in actionable_missing[:100]:
        detail = ", ".join(x for x in [
            row["candidate_class"], row["address"],
            f"Access={row['access']}" if row["access"] else "",
            f"Fee={row['fee']}" if row["fee"] else "",
        ] if x)
        summary_lines.append(f"- **{row['state']} – {row['name']}** ({detail}) – {row['osm_url']}")

    if len(actionable_missing) > 100:
        summary_lines.append(f"- … weitere {len(actionable_missing) - 100} prioritäre Kandidaten siehe CSV")

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
