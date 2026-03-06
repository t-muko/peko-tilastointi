# PEKO Tilastointi

Koiraharjoituspäivkirjasovellus yksityiseen ja yhteiseen käyttöön. Päiväkirjan merkinnät ovat yksityisiä, mutta jokainen käyttäjä jakaa yhteiseen käyttöön tilastoyhteenvetoja merkinnöistään.

## Rakennuspalikat 

Sovellus on rakennettu React ja Material UI kirjastoja hyädyntäen. 
Tilan hallintaan käytetään MobX-kirjastoa.
Tietokantana toimii Googlen Firestore, johon kukin käyttäjä tallentaa merkintönsä Google-tunnuksella kirjautuneena. Firebasen tietomalleja käytetään Firestorter-bindingin avulla.

## Kehitysympäristö

- Node.js 22+
- Yarn
- Vite
- Firebase CLI (`yarn global add firebase-tools`)

Asenna Node ja Yarn. Kloonaa repository ja anna komento `yarn install`
Tämä asentaa kehitysympäristön ja tarvittavat kirjastot.

## Dev Scripts

| Komento            | Kuvaus                                              |
| ------------------ | --------------------------------------------------- |
| `yarn dev`         | Käynnistä paikallinen Vite dev-serveri              |
| `yarn build`       | Tuotantobuild → `build/`                            |
| `yarn preview`     | Esikatsele valmis build paikallisesti               |
| `yarn dev:test`    | Dev-serveri testitilassa (`VITE_USE_EMULATOR=true`) |

## Deploy Hosting

Build and deploy hosting:

```bash
yarn build
firebase deploy --only hosting

firebase deploy --only firestore:rules
```

## Testausautomaatio

Projektissa on kaksi testaustasoa. Katso tarkempi dokumentaatio:

- [Yksikkö- ja komponenttitestit](docs/UI-testaus.md)
- [E2E-testaus Playwrightilla](docs/E2E-testaus.md)
- [Firebase-tietomalli ja mock-toteutukset](docs/Firebase-mock.md)

### Yksikkötestit (Vitest)

```bash
yarn test                 # aja kaikki kerran
yarn test:watch           # watch-tila
yarn test:ui              # graafinen Vitest UI selaimessa
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
yarn test:e2e             # headless
yarn test:e2e:ui          # graafinen Playwright UI
```

## Dokumentaatio ja ohjeistus

`/docs`-kansiossa on dokumentaatiota liittyen sovelluksen eri osien
toteutukseen, arkkitehtuuriin ja testaukseen.

`.github/instructions.md` sisältää ohjeet tekoälyavustajalle. Siitä löytyy myös lyhyt
yhteenveto sovelluksesta ja sen arkkitehtuurista.

## Korjattavat poikkeamat ennen uusia ominaisuuksia

- Firebase-initialisointi on useassa paikassa (`firebaseService.ts` ja `reeniStore.ts`); keskitetään yhteen toteutukseen.
- UI kutsuu osin suoraan infraa (`App.tsx` -> `rootStore.reeniFirestore.reenit.add(...)`); siirretään store-komentojen taakse.
- Store- ja infra-vastuut sekoittuvat (`reeniStore` sisältää Firestorter/Firebase-kytkennän); erotetaan repository/service-kerros.
- `use-stores.ts` ei käytä React-kontekstia tavanomaisella tavalla; selkeytetään yksi virallinen tapa käyttää storeja.
