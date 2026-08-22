#!/usr/bin/env python3
"""Apply the verified 2026-08-22 deep-source sweep to the station chunks."""

from __future__ import annotations

import base64
import gzip
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
CHECKED = "2026-08-22"


def load_stations() -> list[dict]:
    parts = sorted(DATA_DIR.glob("stations-461.part*.b64"))
    payload = "".join(part.read_text(encoding="utf-8").strip() for part in parts)
    return json.loads(gzip.decompress(base64.b64decode(payload)))


def source_record(kind: str, name: str, url: str, note: str, confirms: list[str]) -> dict:
    return {
        "type": kind,
        "name": name,
        "url": url,
        "checked_at": CHECKED,
        "note": note,
        "confirms": confirms,
    }


def station(
    number: int,
    state: str,
    postal: str,
    name: str,
    kind: str,
    cassette: str,
    grey: str,
    water: str,
    trash: str,
    price: str,
    phone: str,
    source_name: str,
    source_url: str,
    note: str,
    lat: float,
    lon: float,
    source_type: str = "editorial",
    verification_status: str = "editorial_confirmed",
    extra_sources: list[dict] | None = None,
) -> dict:
    confirms = ["existence", "access", "coordinates"]
    for field, value in (("cassette", cassette), ("grey", grey), ("water", water), ("trash", trash)):
        if value == "ja":
            confirms.append(field)
    if price:
        confirms.append("price")
    if phone:
        confirms.append("phone")
    sources = [source_record(source_type, source_name, source_url, note, confirms)]
    sources.extend(extra_sources or [])
    return {
        "id": f"ve-{number}",
        "state": state,
        "postal": postal,
        "name": name,
        "status": "BESTÄTIGT: Durchreisende",
        "type": kind,
        "cassette": cassette,
        "grey": grey,
        "water": water,
        "trash": trash,
        "price": price,
        "phone": phone,
        "source": f"{source_name}, geprüft 2026",
        "note": note,
        "sourceUrl": source_url,
        "lat": lat,
        "lon": lon,
        "coordinateQuality": "exact",
        "color": "Grün",
        "lastChecked": CHECKED,
        "sources": sources,
        "checked_at": CHECKED,
        "source_type": source_type,
        "source_url": source_url,
        "source_note": note,
        "verification_status": verification_status,
        "confirms": confirms,
        "discovered_via": "breiter Quellen-Sweep 2026-08-22",
        "source_owner_country": "DE",
        "source_dependency": "operator/municipal with specialist verification"
        if verification_status == "cross_checked"
        else source_type,
        "primary_confirmation": source_type,
    }


def extra(kind: str, name: str, url: str, note: str, confirms: list[str]) -> dict:
    return source_record(kind, name, url, note, confirms)


NEW_STATIONS = [
    station(
        467, "Thüringen", "99734", "Nordhausen, Grimmelallee 40, Badehaus Nordhausen",
        "Kommunale V/E / Durchreise-V/E", "ja", "ja", "ja", "?",
        "6 EUR laut BORDATLAS; Nutzung während der Badehaus-Öffnungszeiten",
        "+49 3631 47990 / +49 3631 479917", "Stadt Nordhausen",
        "https://www.nordhausen.de/rathaus/lebenslagen_lang.php?LebensNr=25071",
        "Die Stadt bestätigt die gebührenpflichtige V/E mit Frischwasser und direktem Kanalanschluss. BORDATLAS bestätigt Kassette, Grauwasser, Durchreisezugang, Preis und exakte Lage.",
        51.506404, 10.784133, "municipal", "cross_checked",
        [extra("editorial", "BORDATLAS – Badehaus Nordhausen", "https://www.bordatlas.de/stellplatz/5617-badehaus-nordhausen/", "Bestätigt Durchreisezugang, Leistungen, Preis und Koordinaten.", ["access", "cassette", "grey", "water", "price", "coordinates"])],
    ),
    station(
        468, "Brandenburg", "16727", "Velten, Bahnstraße 7, Bäckerei Plentz",
        "Betreiber / Stellplatz / Durchreise-V/E", "?", "ja", "ja", "?", "5 EUR",
        "+49 33055 79010", "Bäckerei Plentz",
        "https://www.plentz.de/filialen/wohnmobilstellplaetze/",
        "Der Betreiber bepreist Wasser sowie WC-Ver- und Entsorgung für Durchreisende ausdrücklich. Fachquellen bestätigen Grauwasser; die genaue Kassettentoiletten-Lösung bleibt wegen abweichender Vor-Ort-Angaben offen.",
        52.6859, 13.1709, "operator", "cross_checked",
        [extra("community", "park4night – Bäckerei Plentz Velten", "https://park4night.com/de/place/297563", "Bestätigt Lage und Grauwasser; Kassette nicht eindeutig.", ["existence", "grey", "water", "coordinates"])],
    ),
    station(
        469, "Brandenburg", "16727", "Oberkrämer-Schwante, Dorfstraße 42, Bäckerei Plentz",
        "Betreiber / Stellplatz / Durchreise-V/E", "?", "ja", "ja", "?", "5 EUR",
        "+49 33055 79010", "Bäckerei Plentz",
        "https://www.plentz.de/filialen/wohnmobilstellplaetze/",
        "Der Betreiber bepreist Wasser sowie WC-Ver- und Entsorgung für Durchreisende ausdrücklich. Grauwasser ist fachredaktionell bestätigt; zur Kassettentoiletten-Lösung bestehen abweichende Angaben.",
        52.73637, 13.08532, "operator", "cross_checked",
        [extra("editorial", "promobil – Bäckerei Plentz Schwante", "https://www.promobil.de/stellplatz/stellplatz-an-der-baeckerei-plentz-588f1dc9721d54a52815e10b.html", "Bestätigt Durchreise-V/E, Grauwasser und Wasser.", ["access", "grey", "water", "coordinates"])],
    ),
    station(
        470, "Mecklenburg-Vorpommern", "17440", "Lassan, Garthof 5, Naturcampingplatz Lassan",
        "Betreiber / Campingplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "5 EUR",
        "+49 38374 559951 / +49 151 20299232", "Naturcampingplatz Lassan",
        "https://campingplatz-lassan.de/preise/",
        "Die Betreiberpreisliste nennt V/E für Durchreisende ausdrücklich; die Fachquelle bestätigt vollständige V/E und exakte Lage. Saison 1. April bis 31. Oktober.",
        53.947648, 13.857149, "operator", "cross_checked",
        [extra("editorial", "Stellplatzführer – Naturcamping Lassan", "https://www.stellplatzfuehrer.de/plaetze/listen/alle/12707-p-quickstop-camping-lassen", "Bestätigt vollständige V/E und Koordinaten.", ["cassette", "grey", "water", "coordinates"])],
    ),
    station(
        471, "Thüringen", "98693", "Ilmenau, Wiesenweg 54/56, Wohnmobil-V/E am Parkplatz P2",
        "Kommunale V/E / Durchreise-V/E", "ja", "eingeschränkt", "ja", "?", "Wasser 0,10 EUR/10 l; Entsorgung kostenlos",
        "", "Stadt Ilmenau / Mängelmelder",
        "https://mitmachen.ilmenau.de/node/3262",
        "Die Stadt bestätigt die neue Entsorgungsstelle am Wiesenweg. Kassette und Frischwasser sind nutzbar; ein klassischer Bodeneinlass für Grauwasser fehlt, Ablassen ist nur über Schlauch möglich.",
        50.6915, 10.9138, "municipal", "cross_checked",
        [extra("municipal", "Stadt Ilmenau – Parken", "https://www.ilmenau.de/de/buergerservice/ordnung-und-verkehr/parken-in-ilmenau/", "Verweist vom Parkplatz P2 auf die nahe V/E-Spur.", ["existence", "access"])],
    ),
    station(
        472, "Thüringen", "99887", "Georgenthal-Catterfeld, Am Steinbühl 3, Campingplatz Paulfeld",
        "Campingplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "5 EUR; Wasser 1 EUR",
        "+49 36253 25171", "promobil – Campingplatz Paulfeld",
        "https://www.promobil.de/stellplatz/stellplatz-auf-dem-campingplatz-paulfeld-5c4ec27bfb2670150e3cd624.html",
        "Vollständige V/E für Durchreisende ausdrücklich bepreist; auch im Winter verfügbar.",
        50.823889, 10.608889,
    ),
    station(
        473, "Mecklenburg-Vorpommern", "18442", "Wendorf-Teschenhagen, Bahnweg 3, Stellplatz am Ferienhaus",
        "Privater Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "5 EUR",
        "+49 151 23032535", "promobil – Stellplatz am Ferienhaus Wendorf",
        "https://www.promobil.de/stellplatz/stellplatz-am-ferienhaus-6101c91ac2c1ce0800cda99b.html",
        "Vollständige V/E für Durchreisende ausdrücklich bepreist; Saison April bis Oktober.",
        54.246389, 13.120556,
    ),
    station(
        474, "Sachsen", "01796", "Struppen-Siedlung, Hohe Straße 87A, Stellplatz Familie Teichmann",
        "Privater Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "10 EUR",
        "+49 172 3697171", "promobil – Familie Teichmann",
        "https://www.promobil.de/stellplatz/stellplatz-bei-familie-teichmann-in-der-saechsischen-schweiz-elbsandsteingebirge-64ba44827e873e0008889cb3.html",
        "Vollständige V/E für Durchreisende ausdrücklich bepreist; Zufahrt 8 bis 21 Uhr.",
        50.9175, 14.016111,
    ),
    station(
        475, "Thüringen", "99636", "Rastenberg, Am Haselberg 45a, Wohnmobilstellplatz Finneck",
        "Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "2,50 EUR",
        "+49 36377 839911 / +49 179 4557996", "promobil – Wohnmobilstellplatz Rastenberg",
        "https://www.promobil.de/stellplatz/wohnmobilstellplatz-rastenberg-5ca9209b7fe8ad835c739aa9.html",
        "Vollständige V/E für Durchreisende ausdrücklich bepreist; Winterbetrieb bestätigt, Saison Anfang März bis Mitte Januar.",
        51.187778, 11.4225,
    ),
    station(
        476, "Thüringen", "99894", "Friedrichroda, Bahnhofstraße 55, WOMO Bahnhof",
        "Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "5 EUR; Kassette 2 EUR",
        "+49 3623 3081969 / +49 173 4202863", "promobil – WOMO Bahnhof Friedrichroda",
        "https://www.promobil.de/stellplatz/womo-bahnhof-friedrichroda-657b63635ad2c40008703c6d.html",
        "Camper-Clean-V/E für Durchreisende ausdrücklich bepreist und ganzjährig verfügbar.",
        50.861944, 10.576944,
    ),
    station(
        477, "Brandenburg", "03222", "Lübbenau-Hindenberg, Seestraße 1, Spreewald-Natur-Camping am See",
        "Campingplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "5 EUR",
        "+49 35456 67539", "promobil – Spreewald-Natur-Camping Hindenberg",
        "https://www.promobil.de/stellplatz/spreewald-natur-camping-am-see-5a54b819e5e4351422e5ec1b.html",
        "Vollständige V/E für Durchreisende ausdrücklich bepreist; Winterverfügbarkeit bestätigt.",
        51.857778, 13.856944,
    ),
    station(
        478, "Sachsen", "09661", "Striegistal-Kummersheim, Kummersheim 3, Am Vorwerk",
        "Privater Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "5 EUR",
        "+49 1577 1904178", "promobil – Am Vorwerk Kummersheim",
        "https://www.promobil.de/stellplatz/am-vorwerk-kummersheim-61229375afe6030008788fe1.html",
        "Vollständige V/E für Durchreisende ausdrücklich bepreist; Winterverfügbarkeit bestätigt.",
        51.060556, 13.234444,
    ),
    station(
        479, "Thüringen", "99094", "Erfurt, Gothaer Straße 30, Tor zur Stadt Erfurt",
        "Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "ja", "3 EUR",
        "+49 361 65314820", "promobil – Tor zur Stadt Erfurt",
        "https://www.promobil.de/stellplatz/wohnmobilstellplatz-tor-zur-stadt-erfurt-60a8abf075102106001a7584.html",
        "Camper-Clean-V/E für Durchreisende ausdrücklich bepreist; ganzjährig verfügbar. Müll wird zusätzlich durch BORDATLAS bestätigt.",
        50.956328, 10.984908, "editorial", "cross_checked",
        [extra("editorial", "BORDATLAS – Tor zur Stadt Erfurt", "https://www.bordatlas.de/stellplatz/37817-wohnmobilstellplatz-tor-zur-stadt-erfurt/", "Bestätigt Durchreisezugang, Müll und Koordinaten.", ["access", "trash", "coordinates"])],
    ),
    station(
        480, "Berlin", "13509", "Berlin-Tegel, Waidmannsluster Damm 12, RZB Reisemobil-Zentrum",
        "Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "4 EUR",
        "+49 172 2550810 / +49 30 76684991", "promobil – RZB Reisemobil-Zentrum Berlin",
        "https://www.promobil.de/stellplatz/rzb-reisemobil-zentrum-berlin-62e82b2b74eb4300080a4d49.html",
        "Vollständige V/E für Durchreisende ausdrücklich bepreist; Zugang 8 bis 20 Uhr.",
        52.595556, 13.289167,
    ),
    station(
        481, "Sachsen-Anhalt", "39126", "Magdeburg-Neustädter See, Barleber Straße 1, STRANDPARX cable Island",
        "Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "10 EUR",
        "+49 152 37713818", "promobil – STRANDPARX cable Island",
        "https://www.promobil.de/stellplatz/strandparx-cable-island-64e70e58f7e2b70008a9e557.html",
        "Camper-Clean-V/E für Durchreisende ausdrücklich bepreist; ganzjährig verfügbar.",
        52.175833, 11.637778,
    ),
    station(
        482, "Brandenburg", "15831", "Blankenfelde-Mahlow, Teltower Straße 56, Campingplatz am Mahlower See",
        "Campingplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "8 EUR",
        "+49 3379 3128920", "promobil – Campingplatz am Mahlower See",
        "https://www.promobil.de/stellplatz/campingplatz-am-mahlower-see-bei-berlin-5bb4996b6591ef18cca49ec2.html",
        "Vollständige V/E für Durchreisende ausdrücklich bepreist; kein Winterbetrieb.",
        52.364444, 13.375556,
    ),
    station(
        483, "Brandenburg", "16348", "Marienwerder, Am Wassertor 2, Marienhafen am Werbelliner Kreuz",
        "Marina / Durchreise-V/E", "?", "ja", "ja", "?", "10 EUR; Grauwasser 5 EUR",
        "+49 179 7286338", "promobil – Marienhafen am Werbelliner Kreuz",
        "https://www.promobil.de/stellplatz/stellplatz-marienhafen-am-werbelliner-kreuz-5d57ab10f6d8fb080080c362.html",
        "Durchreise-V/E, Grauwasser und Wasser sind bepreist; eine Kassettentoiletten-Entsorgung ist in der aktuellen Leistungsübersicht nicht bestätigt. Saison April bis Oktober.",
        52.850833, 13.609444,
    ),
    station(
        484, "Sachsen", "01723", "Wilsdruff-Mohorn, Mohorner Höhe 5, Stellplatz Zur Platane",
        "Privater Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "4 EUR; Wasser 1,50 EUR/100 l",
        "+49 172 3735262", "promobil – Stellplatz Zur Platane",
        "https://www.promobil.de/stellplatz/stellplatz-zur-platane-mohorn-5eedd57e05251b080069b408.html",
        "Vollständige V/E für Durchreisende ausdrücklich bepreist.",
        50.993611, 13.453611,
    ),
    station(
        485, "Brandenburg", "03149", "Groß Schacksdorf-Simmersdorf, Mühlberg 8A, Stellplatz Szonn",
        "Privater Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "4 EUR",
        "+49 35695 222 / +49 171 7803212", "promobil – Stellplatz Szonn",
        "https://www.promobil.de/stellplatz/stellplatz-szonn-588f1dd3721d54a52815e253.html",
        "Vollständige V/E für Durchreisende ausdrücklich bepreist; Saison Anfang April bis Ende Oktober. Community-Hinweise melden eine schwierige Grauwasserentsorgung und einen nicht als Trinkwasser gekennzeichneten Hahn.",
        51.7, 14.625556,
    ),
    station(
        486, "Brandenburg", "04931", "Mühlberg/Elbe, Am Hafen 1c, Wasserwanderraststation",
        "Campingplatz / Marina / Durchreise-V/E", "ja", "ja", "?", "?", "1 EUR",
        "+49 175 7093606", "promobil – Wasserwanderraststation Mühlberg/Elbe",
        "https://www.promobil.de/stellplatz/camping-wasserwanderraststion-588f1de1721d54a52815e429.html",
        "Durchreise-V/E und Kassette/Grauwasser sind ausdrücklich bepreist; Frischwasser ist in der aktuellen Leistungsübersicht nicht bestätigt. Saison Anfang April bis Ende Oktober.",
        51.433889, 13.208889,
    ),
    station(
        487, "Mecklenburg-Vorpommern", "17194", "Jabel, Am Heidenfriedhof 1, Natur- und Strandcamping am Jabelschen See",
        "Campingplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "5 EUR",
        "+49 3992 976712", "promobil – Natur- und Strandcamping Jabel",
        "https://www.promobil.de/stellplatz/genussferien-natur-und-strandcamping-am-jabelschen-see-5c33de6e1ff19c6c2de673a7.html",
        "Vollständige V/E für Durchreisende ausdrücklich bepreist; Saison Anfang April bis Ende Oktober.",
        53.52, 12.517222,
    ),
    station(
        488, "Thüringen", "99869", "Drei Gleichen-Mühlberg, Campingplatz 1, Campingplatz Drei Gleichen",
        "Campingplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "5 EUR",
        "+49 36256 22715 / +49 171 3122715", "promobil – Campingplatz Drei Gleichen",
        "https://www.promobil.de/stellplatz/campingplatz-drei-gleichen-5a54b765e5e4351422e5df81.html",
        "Camper-Clean-V/E für Durchreisende ausdrücklich bepreist; Saison Anfang April bis Ende Oktober.",
        50.874722, 10.809167,
    ),
    station(
        489, "Thüringen", "98559", "Oberhof, Jahnstraße 7, Wohnmobilstellplatz Oberhof",
        "Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "5 EUR; Wasser 1 EUR/80 l",
        "+49 36842 575012", "promobil – Wohnmobilstellplatz Oberhof",
        "https://www.promobil.de/stellplatz/wohnmobilstellplatz-oberhof-588f1f0e721d54a5281604bb.html",
        "Holiday-Clean-V/E für Durchreisende ausdrücklich bepreist. Die veröffentlichte Saisonangabe Anfang Dezember bis Ende Februar sollte vor Anfahrt geprüft werden.",
        50.70331, 10.72844,
    ),
    station(
        490, "Thüringen", "99636", "Ostramondra, Bahnhofstraße 30a, Stellplatz Am Gartenberg",
        "Betreiber / Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "ja", "2,50 EUR",
        "+49 173 8777227 / +49 174 9065367", "Stellplatz Am Gartenberg / TopPlatz",
        "https://top-platz.de/ostramondra/",
        "2025 eröffneter Platz mit vollständiger V/E und Bodeneinlass. Fachquellen bepreisen V/E für Durchreisende ausdrücklich; ganzjährig geöffnet.",
        51.203056, 11.3275, "operator", "cross_checked",
        [extra("editorial", "promobil – Am Gartenberg Ostramondra", "https://www.promobil.de/stellplatz/stellplatz-am-gartenberg-in-ostramondra-679fae68e229ec0008b4efdd.html", "Bestätigt vollständige Durchreise-V/E und Preis.", ["access", "cassette", "grey", "water", "price", "coordinates"])],
    ),
    station(
        491, "Thüringen", "98617", "Meiningen, Frankental 48, Wohnmobilstellplatz Rohrer Stirn",
        "Kommunaler Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "2,50 EUR; Wasser 0,50 EUR",
        "+49 3693 484421", "promobil – Wohnmobilstellplatz Rohrer Stirn",
        "https://www.promobil.de/stellplatz/stellplatz-rohrer-stirn-588f1dd9721d54a52815e32c.html",
        "V/E für Durchreisende ausdrücklich bepreist; Saison Ende März bis Anfang November.",
        50.569722, 10.434722,
    ),
    station(
        492, "Thüringen", "99834", "Gerstungen-Marksuhl-Lindigshof, Im Lindigshof 16, Auszeit Lindigshof",
        "Betreiber / Privater Stellplatz / Durchreise-V/E", "ja", "ja", "ja", "?", "kostenlos",
        "+49 172 4409982", "promobil + Betreiber – Auszeit Lindigshof",
        "https://www.promobil.de/stellplatz/auszeit-lindigshof-60e5e05868b6220700db2bd8.html",
        "Vollständige V/E für Durchreisende ausdrücklich kostenlos; Betreiberseite bestätigt Adresse und Kontakt. Saison Anfang April bis Ende Oktober.",
        50.888333, 10.215278, "operator", "cross_checked",
        [extra("operator", "Auszeit Lindigshof", "https://www.auszeit-lindigshof.de/", "Bestätigt Betrieb, Adresse und Kontakt.", ["existence", "address", "phone"])],
    ),
]


UPDATES = {
    "ve-66": dict(status="BESTÄTIGT: Durchreisende", water="ja", trash="ja", price="V/E für Durchreisende ab 1 EUR; Fachquelle nennt 2 EUR", phone="+49 3381 8908100", source="BORDATLAS + promobil 2026", sourceUrl="https://www.bordatlas.de/stellplatz/36293-stadtmarina-brandenburg-havel/", note="Durchreise-V/E ist ausdrücklich bestätigt; Kassette, Grauwasser, Frischwasser und Müll vorhanden.", lat=52.424526, lon=12.553417, coordinateQuality="exact", color="Grün"),
    "ve-16": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="Gebühr beim Betreiber", phone="+49 170 2907030", source="Gemeinde Rehfelde 2026", sourceUrl="https://www.gemeinde-rehfelde.de/verzeichnis/visitenkarte.php?mandat=96422", note="Die Gemeinde bestätigt ausdrücklich, dass Durchreisende die V/E-Anlage nutzen können.", color="Grün"),
    "ve-402": dict(name="Sangerhausen, Hüttenstraße 57b, Rosenstädter Wohnmobiloase", status="BESTÄTIGT: Durchreisende", water="ja", trash="ja", price="V/E für Durchreisende 5 EUR", phone="+49 3464 5451790 / +49 163 7246764", source="Stellplatzführer + promobil 2026", sourceUrl="https://www.stellplatzfuehrer.de/plaetze/listen/alle/33527-rosenstaedter-wohnmobiloase", note="Vollständige V/E und Müll für Durchreisende ausdrücklich bepreist; Hausnummer 57b laut aktueller Detailquelle.", lat=51.480468, lon=11.30446, coordinateQuality="exact", color="Grün"),
    "ve-394": dict(status="BESTÄTIGT: Durchreisende", water="ja", trash="ja", price="V/E für Durchreisende 3,50 EUR", source="Stellplatzführer 2026", sourceUrl="https://www.stellplatzfuehrer.de/plaetze/listen/alle/33422-womopark24-thale", note="Vollständige V/E und Müll für Durchreisende ausdrücklich bepreist.", lat=51.75785, lon=11.036697, coordinateQuality="exact", color="Grün"),
    "ve-397": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 5 EUR", source="promobil + TopPlatz 2026", sourceUrl="https://www.promobil.de/stellplatz/wohnmobilstellplatz-bocksberg-60a16c13313c3f060083f86f.html", note="Vollständige V/E für Durchreisende ausdrücklich bepreist.", lat=51.691083, lon=11.034694, coordinateQuality="exact", color="Grün"),
    "ve-134": dict(note="Durchreise-V/E 4 EUR; Koordinaten anhand aktueller Fachquelle korrigiert.", lat=53.512222, lon=12.709444, coordinateQuality="exact", source="Betreiber + Stellplatzführer 2026", sourceUrl="https://www.stellplatzfuehrer.de/plaetze/listen/alle/31173-sp-meck-charter-caravan"),
    "ve-385": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 8 EUR laut promobil 2026; ältere Quelle 2 EUR", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-am-geiseltalsee-588f1db5721d54a52815de48.html", note="Vollständige V/E für Durchreisende bestätigt; zum Preis existiert eine ältere abweichende Angabe.", color="Grün"),
    "ve-301": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 2 EUR", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/touristik-zentrum-66b376705003180008a57364.html", note="V/E für Durchreisende ausdrücklich bepreist.", color="Grün"),
    "ve-58": dict(status="BESTÄTIGT: Durchreisende", grey="ja", price="V/E für Durchreisende 5 EUR", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-marina-beetzsee-588f1fcf721d54a528161629.html", note="Vollständige V/E und Müll für Durchreisende ausdrücklich bepreist; kein Winterbetrieb.", color="Grün"),
    "ve-261": dict(status="BESTÄTIGT: Durchreisende", cassette="ja", water="ja", price="V/E für Durchreisende 5 EUR", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-am-hotel-landhaus-nassau-588f1f17721d54a528160575.html", note="Vollständige V/E für Durchreisende ausdrücklich bepreist; kein Winterbetrieb.", color="Grün"),
    "ve-62": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende kostenlos; Wasser 1 EUR/30 l", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-suedpromenade-588f205a721d54a5281622de.html", note="V/E für Durchreisende ausdrücklich kostenlos; Wasser separat. Kein Winterbetrieb.", color="Grün"),
    "ve-28": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 3 EUR", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-auf-dem-oekohof-engler-588f1d5f721d54a52815d2fc.html", note="Vollständige V/E für Durchreisende ausdrücklich bepreist.", color="Grün"),
    "ve-457": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 2 EUR; Wasser 1 EUR/80 l", phone="+49 3695 693434", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/sole-reisemobilhafen-588f1d81721d54a52815d76e.html", note="Holiday-Clean-V/E für Durchreisende ausdrücklich bepreist und ganzjährig verfügbar.", color="Grün"),
    "ve-30": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 5 EUR", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-am-spargelhof-klaistow-5b0ac9cba54a0ac2a2b4b8d7.html", note="Vollständige V/E für Durchreisende ausdrücklich bepreist; kein Winterbetrieb.", color="Grün"),
    "ve-282": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 5 EUR", phone="+49 173 4891503", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-limbach-5b70680d24a6560219e515e1.html", note="Grauwasser und Wasser für Durchreisende ausdrücklich bepreist; Kassettentoilette bleibt wegen der aktuellen Leistungsübersicht offen.", lat=51.051111, lon=13.483611, coordinateQuality="exact", color="Grün"),
    "ve-441": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 2 EUR", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-saalestrand-588f1d5d721d54a52815d2b9.html", note="Vollständige V/E für Durchreisende ausdrücklich bepreist.", color="Grün"),
    "ve-38": dict(status="BESTÄTIGT: Durchreisende", cassette="ja", grey="ja", water="?", price="Gebühr vor Ort", source="BORDATLAS 2026", sourceUrl="https://www.bordatlas.de/stellplatz/99990000005713-total-autohof-werder-havel/", note="Sani-Station mit Kassetten- und Grauwasserentsorgung; Nutzung durch Durchreisende ausdrücklich erlaubt.", lat=52.3886655, lon=12.8479712, coordinateQuality="exact", color="Grün"),
    "ve-295": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 1,50 EUR", phone="+49 3585 47260", source="BORDATLAS 2026", sourceUrl="https://www.bordatlas.de/stellplatz/4769-mittel-muehle-rosenbach-bischdorf/", note="Vollständige V/E für Durchreisende ausdrücklich bestätigt.", lat=51.099096, lon=14.74053, coordinateQuality="exact", color="Grün"),
    "ve-454": dict(status="BESTÄTIGT: Durchreisende", water="ja", trash="ja", price="Gebühr vor Ort", phone="+49 172 6487543", source="BORDATLAS 2026", sourceUrl="https://www.bordatlas.de/stellplatz/4501-bergwiese-thueringen-thalwenden/", note="Vollständige V/E und Müll; Nutzung durch Durchreisende ausdrücklich erlaubt.", lat=51.353029, lon=10.042544, coordinateQuality="exact", color="Grün"),
    "ve-445": dict(status="BESTÄTIGT: Durchreisende", price="Entsorgung 1 EUR; Wasser 1 EUR/5 min", phone="+49 3601 452115 / +49 3601 813272", source="Stadt Mühlhausen + BORDATLAS 2026", sourceUrl="https://www.bordatlas.de/stellplatz/37219-wohnmobilstellplatz-engelsgarten-muehlhausen-thueringen/", note="Vollständige V/E; Nutzung durch Durchreisende ausdrücklich erlaubt.", lat=51.210532, lon=10.464186, coordinateQuality="exact", color="Grün"),
    "ve-79": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="Gebühr vor Ort", phone="+49 3385 514991 / +49 3385 596322", source="BORDATLAS 2026", sourceUrl="https://www.bordatlas.de/stellplatz/11783-stellplatz-am-rathenower-stadtkanal-rathenow/", note="Vollständige V/E; Nutzung durch Durchreisende ausdrücklich erlaubt.", lat=52.607969, lon=12.336273, coordinateQuality="exact", color="Grün"),
    "ve-204": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 5 EUR je angefangene Stunde", phone="+49 385 3990200", source="BORDATLAS 2026", sourceUrl="https://www.bordatlas.de/stellplatz/11797-parkplatz-am-hauptbahnhof-schwerin/", note="Vollständige V/E für Durchreisende ausdrücklich erlaubt.", lat=53.636057, lon=11.408487, coordinateQuality="exact", color="Grün"),
    "ve-7": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 10 EUR", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/wohnmobilstellplatz-der-marina-lanke-berlin-588f1fa4721d54a528161304.html", note="Vollständige V/E für Durchreisende ausdrücklich bepreist.", color="Grün"),
    "ve-185": dict(status="BESTÄTIGT: Durchreisende (Teilservice)", water="ja", price="Gebühr vor Ort", phone="+49 179 2663611", source="BORDATLAS 2026", sourceUrl="https://www.bordatlas.de/stellplatz/9249-wohnmobilstellplatz-dorfrepublik-rueterberg/", note="Durchreisezugang bestätigt; Grauwasser und Frischwasser vorhanden, keine Kassettentoiletten-Entsorgung.", lat=53.151923, lon=11.185585, coordinateQuality="exact", color="Grün"),
    "ve-352": dict(status="BESTÄTIGT: Durchreisende", price="V/E für Durchreisende kostenlos", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-am-bergwitzsee-588f1d5e721d54a52815d2d1.html", note="Kassette und Grauwasser für Durchreisende ausdrücklich kostenlos; Frischwasser nicht bestätigt. Saison Anfang Mai bis Ende September.", color="Grün"),
    "ve-369": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 3 EUR", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-storchenwiese-588f1e70721d54a52815f518.html", note="Vollständige V/E für Durchreisende ausdrücklich bepreist.", color="Grün"),
    "ve-355": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende kostenlos", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/wohnmobilstellplatz-tangermuende-588f1ff5721d54a52816193c.html", note="Vollständige V/E für Durchreisende ausdrücklich kostenlos und ganzjährig verfügbar.", color="Grün"),
    "ve-393": dict(status="BESTÄTIGT: Durchreisende", cassette="ja", water="ja", price="V/E für Durchreisende 3 bis 5 EUR; vor Ort prüfen", phone="+49 172 3975409", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-tettenborn-64233ef1efbcbe00087e2b14.html", note="Vollständige V/E für Durchreisende bestätigt; die aktuelle Seite nennt widersprüchlich 3 und 5 EUR.", lat=51.28, lon=11.641667, coordinateQuality="exact", color="Grün"),
    "ve-259": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende 3 EUR", phone="+49 35772 40235", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/ver-und-entsorgungsstation-wohnmobilstellplatz-erlichthof-6021a4d6885d0b0600b35e43.html", note="Vollständige V/E für Durchreisende ausdrücklich bepreist und ganzjährig verfügbar.", lat=51.4025, lon=14.789167, coordinateQuality="exact", color="Grün"),
    "ve-425": dict(status="BESTÄTIGT: Durchreisende", water="ja", price="V/E für Durchreisende kostenlos; Wasser 1 EUR/100 l", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-eisenberg-588f1dc5721d54a52815e077.html", note="Elomat-V/E für Durchreisende ausdrücklich kostenlos und ganzjährig verfügbar.", color="Grün"),
    "ve-24": dict(status="BESTÄTIGT: Durchreisende", price="V/E für Durchreisende 2 EUR; Wasser 0,10 EUR/10 l", source="promobil 2026", sourceUrl="https://www.promobil.de/stellplatz/stellplatz-am-krongut-588f1e37721d54a52815ee8d.html", note="Vollständige V/E für Durchreisende ausdrücklich bepreist und ganzjährig verfügbar.", color="Grün"),
}


def apply_updates(stations: list[dict]) -> None:
    by_id = {item["id"]: item for item in stations}
    for station_id, changes in UPDATES.items():
        item = by_id[station_id]
        item.update(changes)
        item["lastChecked"] = CHECKED
        item["checked_at"] = CHECKED
        item["source_type"] = "editorial"
        item["source_url"] = item.get("sourceUrl", "")
        item["source_note"] = item.get("note", "")
        item["verification_status"] = "editorial_confirmed"
        item["source_owner_country"] = "DE"
        item["source_dependency"] = "specialist or municipal confirmation"
        item["primary_confirmation"] = "editorial"
        confirms = ["existence", "access"]
        for field in ("cassette", "grey", "water", "trash"):
            if item.get(field) == "ja":
                confirms.append(field)
        if item.get("price"):
            confirms.append("price")
        if item.get("phone"):
            confirms.append("phone")
        if item.get("coordinateQuality") == "exact":
            confirms.append("coordinates")
        item["confirms"] = confirms


def write_stations(stations: list[dict]) -> None:
    serialized = json.dumps(stations, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    encoded = base64.b64encode(gzip.compress(serialized, mtime=0)).decode("ascii")
    parts = sorted(DATA_DIR.glob("stations-461.part*.b64"))
    width = (len(encoded) + len(parts) - 1) // len(parts)
    for index, part in enumerate(parts):
        part.write_text(encoded[index * width : (index + 1) * width] + "\n", encoding="utf-8")


def main() -> None:
    stations = load_stations()
    if len(stations) == 466:
        apply_updates(stations)
        stations.extend(NEW_STATIONS)
    elif len(stations) == 492 and all(any(item["id"] == fresh["id"] for item in stations) for fresh in NEW_STATIONS):
        apply_updates(stations)
        by_id = {item["id"]: item for item in NEW_STATIONS}
        stations = [by_id.get(item["id"], item) for item in stations]
    else:
        raise RuntimeError(f"Expected v3.5 base or v3.6 output, got {len(stations)} stations")
    if len(stations) != 492 or len({item["id"] for item in stations}) != 492:
        raise RuntimeError("Invalid v3.6 station set")
    write_stations(stations)
    print("Wrote 492 stations: 26 additions and 31 verified updates")


if __name__ == "__main__":
    main()
