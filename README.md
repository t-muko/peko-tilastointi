# PEKO Tilastointi

Frontend is built with Vite and deployed to Firebase Hosting.

## Requirements

- Node.js 22+
- npm 10+
- Firebase CLI (`npm install -g firebase-tools`)

## Dev Scripts

| Komento            | Kuvaus                                              |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | Käynnistä paikallinen Vite dev-serveri              |
| `npm run build`    | Tuotantobuild → `build/`                            |
| `npm run preview`  | Esikatsele valmis build paikallisesti               |
| `npm run dev:test` | Dev-serveri testitilassa (`VITE_USE_EMULATOR=true`) |

## Deploy Hosting

Build and deploy hosting:

```bash
npm run build
firebase deploy --only hosting

firebase deploy --only firestore:rules
```

## Cloud Functions

Functions live under `functions/` and have their own dependencies:

```bash
npm --prefix functions install
npm --prefix functions run lint
```

## Testaus

Projektissa on kaksi testaustasoa. Katso tarkempi dokumentaatio:

- [Yksikkö- ja komponenttitestit](docs/UI-testaus.md)
- [E2E-testaus Playwrightilla](docs/E2E-testaus.md)
- [Firebase-tietomalli ja mock-toteutukset](docs/Firebase-mock.md)

### Yksikkötestit (Vitest)

```bash
npm test                  # aja kaikki kerran
npm run test:watch        # watch-tila
npm run test:ui           # graafinen Vitest UI selaimessa
```

### E2E-testit (Playwright)

E2E-testit vaativat paikallisen Firebase-emulaattorin:

```bash
# Terminaali 1 — käynnistä emulaattori
firebase emulators:start --only firestore,auth

Tarvittaessa aja ensin:
firebase login:use teemu@pirkanmaanpelastuskoirat.fi
firebase projects:list

# Terminaali 2 — aja E2E-testit
npm run test:e2e          # headless
npm run test:e2e:ui       # graafinen Playwright UI
```

## Dokumentaatio ja ohjeistus

`/docs`-kansiossa on dokumentaatiota liittyen sovelluksen eri osien
toteutukseen, arkkitehtuuriin ja testaukseen.

`.github/instructions.md` sisältää ohjeet tekoälyavustalle. Siinä on myös lyhyt
yhteenveto sovelluksesta ja sen arkkitehtuurista.
