# V/E Finder – native iPhone-Hülle

Diese kleine SwiftUI-App lädt den bestehenden V/E Finder von GitHub Pages in einer WKWebView.
Der entscheidende Unterschied zur Safari/PWA-Version: `om://`-Links werden von der nativen App abgefangen und direkt mit `UIApplication.open(...)` an Organic Maps übergeben.

## Voraussetzungen

- Mac mit aktuellem Xcode
- iPhone per Kabel oder WLAN mit Xcode verbunden
- Apple-ID in Xcode angemeldet
- Organic Maps auf dem iPhone installiert

## Installation auf dem eigenen iPhone

1. Repository auf den Mac laden.
2. `ios/VEFinder.xcodeproj` in Xcode öffnen.
3. Links das Projekt **VEFinder** wählen.
4. Unter **Signing & Capabilities** bei **Team** das eigene Apple-Konto / Personal Team auswählen.
5. Falls Xcode meldet, dass die Bundle-ID nicht verfügbar ist, `de.vefinder.app` in eine persönliche eindeutige Bundle-ID ändern.
6. Oben als Ziel das eigene iPhone auswählen.
7. ▶︎ **Run** drücken.
8. Auf dem iPhone Standortzugriff erlauben.

## Test

- CARBOTEC öffnen.
- **Navigation starten** antippen.
- Die native Hülle fängt den `om://v2/nav`-Link ab und öffnet Organic Maps direkt mit dem Zielpunkt.

## Hinweis zur Signierung

Mit einem kostenlosen Apple-Personal-Team lässt sich die App für den eigenen Test auf das iPhone installieren. Je nach Apple-Provisioning kann eine erneute Signierung nach einigen Tagen erforderlich sein. Mit einem kostenpflichtigen Apple Developer Account sind längere Laufzeiten und reguläre Verteilung möglich.
