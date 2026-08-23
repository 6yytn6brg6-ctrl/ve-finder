#!/usr/bin/env python3
"""Generate a reproducible multilingual discovery queue for every registered source."""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "docs" / "source-registry.json"
PROJECT_STATES = (
    "Berlin",
    "Brandenburg",
    "Mecklenburg-Vorpommern",
    "Sachsen",
    "Sachsen-Anhalt",
    "Thüringen",
)

PHRASE_GROUPS = {
    "de": {
        "external_access": '"für Durchreisende" OR "für Passanten" OR Fremdentsorgung OR Nichtgäste',
        "no_overnight": '"ohne Übernachtung" OR "nur V/E" OR "nur Ver- und Entsorgung"',
        "separate_access": '"vor der Einfahrt" OR "vor der Schranke" OR "separate Servicestation"',
        "service_tariff": 'Servicepauschale OR Kurzzeitservice OR "5h + Dienste" OR Quickstop',
        "negative": '"nur für Gäste" OR "keine V/E für Durchreisende" OR "Übernachtung erforderlich"',
    },
    "nl": {
        "external_access": '"campers op doorreis" OR passanten OR "niet-gasten"',
        "no_overnight": '"zonder overnachting" OR "alleen lozen" OR "alleen service"',
        "separate_access": '"voor de ingang" OR "voor de slagboom" OR "aparte serviceplaats"',
        "service_tariff": 'servicetarief OR "kort parkeren" OR serviceplaats',
        "negative": '"alleen voor gasten" OR "overnachting verplicht"',
    },
    "fr": {
        "external_access": '"camping-cars de passage" OR non-résidents OR visiteurs',
        "no_overnight": '"sans nuitée" OR "sans stationnement" OR "vidange seule"',
        "separate_access": '"avant l’entrée" OR "hors barrière" OR "station séparée"',
        "service_tariff": '"forfait services" OR "stationnement 5h + services" OR "aire de services"',
        "negative": '"réservé aux clients" OR "nuitée obligatoire"',
    },
    "en": {
        "external_access": '"passing motorhomes" OR "transit motorhomes" OR non-guests',
        "no_overnight": '"without overnight stay" OR "service only" OR "dump only"',
        "separate_access": '"before the entrance" OR "outside the barrier" OR "separate service point"',
        "service_tariff": '"service fee" OR "short stay + services" OR "dump station"',
        "negative": '"guests only" OR "overnight stay required"',
    },
    "pl": {
        "external_access": '"kampery przejazdem" OR "dla osób z zewnątrz"',
        "no_overnight": '"bez noclegu" OR "tylko serwis" OR "tylko zrzut"',
        "separate_access": '"przed wjazdem" OR "przed szlabanem" OR "oddzielna stacja"',
        "service_tariff": '"opłata serwisowa" OR "stacja zrzutu" OR "punkt serwisowy"',
        "negative": '"tylko dla gości" OR "nocleg obowiązkowy"',
    },
    "cs": {
        "external_access": '"pro neubytované" OR "obytná auta projíždějící"',
        "no_overnight": '"bez přenocování" OR "pouze servis"',
        "separate_access": '"před vjezdem" OR "před závorou" OR "samostatné servisní místo"',
        "service_tariff": '"servisní poplatek" OR "servisní místo"',
        "negative": '"pouze pro hosty" OR "přenocování povinné"',
    },
    "it": {
        "external_access": '"camper di passaggio" OR "clienti esterni"',
        "no_overnight": '"senza pernottamento" OR "solo carico scarico" OR "solo servizi"',
        "separate_access": '"prima dell’ingresso" OR "prima della sbarra" OR "area separata"',
        "service_tariff": '"tariffa servizi" OR "area di servizio" OR "camper service"',
        "negative": '"solo per ospiti" OR "pernottamento obbligatorio"',
    },
    "es": {
        "external_access": '"autocaravanas de paso" OR "usuarios externos"',
        "no_overnight": '"sin pernoctar" OR "solo carga y descarga" OR "solo servicios"',
        "separate_access": '"antes de la entrada" OR "antes de la barrera" OR "área separada"',
        "service_tariff": '"tarifa de servicios" OR "área de servicio"',
        "negative": '"solo para huéspedes" OR "pernocta obligatoria"',
    },
    "pt": {
        "external_access": '"autocaravanas de passagem" OR "utilizadores externos"',
        "no_overnight": '"sem pernoita" OR "apenas serviços" OR "apenas despejo"',
        "separate_access": '"antes da entrada" OR "antes da barreira" OR "área separada"',
        "service_tariff": '"tarifa de serviços" OR "área de serviço"',
        "negative": '"apenas para hóspedes" OR "pernoita obrigatória"',
    },
    "da": {
        "external_access": '"autocampere på gennemrejse" OR "eksterne gæster"',
        "no_overnight": '"uden overnatning" OR "kun service" OR "kun tømning"',
        "separate_access": '"før indgangen" OR "før bommen" OR "separat servicestation"',
        "service_tariff": 'servicegebyr OR tømningsstation',
        "negative": '"kun for gæster" OR "overnatning påkrævet"',
    },
}


def rows(region: str) -> list[dict[str, str]]:
    sources = json.loads(REGISTRY.read_text(encoding="utf-8"))
    output = []
    for source in sources:
        for language in source["languages"]:
            for concept, phrases in PHRASE_GROUPS.get(language, {}).items():
                output.append({
                    "priority": source["priority"],
                    "source": source["name"],
                    "domain": source["domain"],
                    "language": language,
                    "concept": concept,
                    "query": f'site:{source["domain"]} ({phrases}) Wohnmobil Deutschland {region}'.strip(),
                })
    return output


def project_rows() -> list[dict[str, str]]:
    """Return the complete 580-query matrix for the agreed six-state scope."""
    region = "(" + " OR ".join(f'\"{state}\"' for state in PROJECT_STATES) + ")"
    output = rows(region)
    sources = json.loads(REGISTRY.read_text(encoding="utf-8"))
    for source in sources:
        for state in PROJECT_STATES:
            output.append({
                "priority": source["priority"],
                "source": source["name"],
                "domain": source["domain"],
                "language": "all",
                "concept": "state_coverage",
                "query": (
                    f'site:{source["domain"]} Wohnmobil '
                    '(Entsorgung OR "Ver- und Entsorgung" OR Servicestation OR '
                    f'"dump station" OR "aire de services") "{state}"'
                ),
            })
    return output


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--region", default="", help="Bundesland, Landkreis oder Ort")
    parser.add_argument(
        "--project-matrix",
        action="store_true",
        help="vollständige Sprach-/Bedeutungs- und Quellen-/Ländermatrix für die sechs Zielländer",
    )
    parser.add_argument("--priority", choices=["A", "B"], help="optional nur eine Priorität")
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    queue = project_rows() if args.project_matrix else rows(args.region)
    if args.priority:
        queue = [row for row in queue if row["priority"] == args.priority]
    if args.limit:
        queue = queue[: args.limit]

    writer = csv.DictWriter(sys.stdout, fieldnames=["priority", "source", "domain", "language", "concept", "query"])
    writer.writeheader()
    writer.writerows(queue)


if __name__ == "__main__":
    main()
