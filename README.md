# PEKO Tilastointi

Koiraharjoituspaivakirjasovellus yksityiseen ja yhteiseen kayttoon. Paivakirjan merkinnat ovat yksityisia, mutta jokainen kayttaja jakaa yhteiseen kayttoon tilastoyhteenvetoja merkinnnoistaan.

## Rakennuspalikat

Sovellus on rakennettu React- ja Material UI -kirjastoja hyodyntaen.
Tilan hallintaan käytetään MobX-kirjastoa.
Tietokantana toimii Googlen Firestore, johon kukin kayttaja tallentaa merkintansa Google-tunnuksella kirjautuneena. Firebasen tietomalleja kaytetaan Firestorter-bindingin avulla.

## Arkkitehtuuri (nykytila)

- Firebase-init on keskitetty tiedostoon `src/components/Firebase/firebaseApp.ts`.
- Kaikki Firebase-appin alustus kulkee funktion `getOrCreateFirebaseApp()` kautta.
- `RootStore` alustaa `reeniFirestore`-storen ennen `firebase`-servicea tiedostossa `src/stores/index.ts`.
- Auth-callback (`onAuthStateChanged`) paivittaa aina ensin `sessionStore`n ja vaihtaa sen jalkeen Firestore-polun.
- Jos `user.getIdToken()` epaonnistuu, polun vaihto tehdan silti (fallback kayttajan UID:lla).
- `sessionStore.userOk` riippuu vain `authUser`-tilasta (`authUser && authUser.uid`).
- UI:n lisaystoiminto (`App.tsx`) kutsuu storen komentoa `addDefaultReeni()` eika kirjoita suoraan `reenit.add(...)`-kokoelmaan.
- Reenidatan kirjoitus kulkee repository-abstraktion kautta: `ReeniRepository` + `FirestorterReeniRepository`.

## Kehitysympäristö

- Node.js 22+
- Yarn
- Vite
- Firebase CLI (`yarn global add firebase-tools`)

Asenna Node ja Yarn. Kloonaa repository ja aja komento `yarn install`.
Tämä asentaa kehitysympäristön ja tarvittavat kirjastot.

## Tekoälyagenttipohjainen kehittäminen

1. Kayta VS Codea tai GitHub Codespaces -kehitysymparistoa.
2. Luo uusi Markdown-dokumentti `docs/`-kansioon ja kuvaa lyhyesti tavoite. Tee yksi kokonaisuus kerrallaan.
3. Pida dokumentti auki ja kaynnista suunnittelu komennolla `/suunnittelu`.
4. Lue suunnitelma lapi ja tee tarvittavat korjaukset.
5. Kaynnista testivaihe komennolla `/testitavoite`.
6. Kaynnista toteutus komennolla `/toteuta`.
7. Jos suunnitelmassa on useita vaiheita, kayta tarkennusta, esim. `/toteuta vaihe 2`.
8. Testaa muutokset myos manuaalisesti.
9. Komenna seuraavaksi `/katselmoi`.
10. Tee tarvittaessa korjaukset komennolla `/toteuta`.
11. Paivita dokumentaatio komennolla `/dokumentoi`.

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

`.github/copilot-instructions.md` sisältää ohjeet tekoälyavustajalle. Siitä löytyy myös lyhyt
yhteenveto sovelluksesta ja sen arkkitehtuurista.

## Toteutetut arkkitehtuurikorjaukset

Seuraavat aiemmin dokumentoidut poikkeamat on korjattu toteutukseen:

- Firebase-initialisointi ei ole enaa hajautettu useaan paikkaan, vaan kayttaa keskitettya `getOrCreateFirebaseApp()`-toteutusta.
- UI ei lisaa reeneja suoraan Firestorter-kokoelmaan, vaan kutsuu store-komentoa `addDefaultReeni()`.
- `reeniStore` ei sisalla suoria Firebase-init-kutsuja, vaan kayttaa repository-rajapintaa (`ReeniRepository`).
- `use-stores.ts` lukee storen `FirebaseContext`in kautta ja heittaa virheen, jos provider puuttuu.
