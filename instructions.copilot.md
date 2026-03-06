# Copilot Instructions - peko-tilastointi

## Sovelluksen arkkitehtuuri

Sovellus on React + TypeScript -sovellus, jossa tila hallitaan MobX-storeilla ja data tallennetaan Firebaseen (Authentication + Firestore).

Tavoitetila ei ole täysi Clean Architecture, vaan kevyt ja käytännöllinen "clean enough" -malli, joka sopii pienen sovelluksen ylläpitoon.

### Kokonaisrakenne
- UI-komponentit sijaitsevat hakemistossa `src/components`.
- Sovelluksen globaali tila ja datalogiikka sijaitsevat hakemistossa `src/stores`.
- Firebase-integraatio sijaitsee hakemistossa `src/components/Firebase`.
- Sovellus alustetaan tiedostossa `src/index.tsx`, jossa `rootStore` annetaan `FirebaseContext.Provider`-kontekstin kautta.

### RootStore ja MobX-storet
`src/stores/index.ts` kokoaa storet yhteen `RootStore`-luokaksi.

Käytössä olevat keskeiset storet:
- `sessionStore`: säilyttää kirjautuneen käyttäjän (`authUser`) ja tarjoaa `userOk`-tilan.
- `messageStore`: yleinen viestitila ja listamuunnos (`messageList`).
- `reeniFirestore` (`ReeniFireStorter`): Firestorter-kokoelma harjoitusmerkinnöille.
- `firebase`: Firebase-palveluluokka autentikointiin ja auth-tilan seurantaan.

Nykyinen datavirta:
1. `Firebase` kuuntelee auth-tilaa (`onAuthStateChanged`).
2. `sessionStore.setAuthUser(...)` päivittää kirjautumisen tilan.
3. `reeniFirestore.changePath(...)` vaihtaa Firestore-polun käyttäjän UID:n mukaan.
4. UI (`App.tsx` ja muut komponentit) renderöi näkymän MobX-observablen tilan perusteella.

### Firebase autentikointi
Autentikointi toteutetaan tiedostossa `src/components/Firebase/firebaseService.ts`.

Toteutuksen pääkohdat:
- Google-kirjautuminen: `signInWithPopup(this.auth, this.provider)`.
- Uloskirjautuminen: `signOut(this.auth)`.
- Auth-tilan kuuntelu: `onAuthStateChanged(...)`.
- Testi/emulaattorituki:
- `VITE_USE_EMULATOR === 'true'` kytkee Auth- ja Firestore-emulaattorit.
- `autentikoiTestissa(email, password)` on tarkoitettu vain emulaattoritilaan.

### Firebase käyttö (Firestore)
Firestorea käytetään pääosin Firestorter-kirjaston kautta (`src/stores/reeniStore.ts`).

Pääperiaate:
- Oletuspolku on anonyymi: `reenit/anonyymi/reenit`.
- Kirjautumisen jälkeen polku vaihtuu muotoon `reenit/{uid}/reenit`.
- Kyselyt järjestetään kentän `pvm` mukaan laskevasti.
- Uusia merkintöjä lisätään UI:sta `reenit.add(...)`-kutsulla.

## Kevyt arkkitehtuurimalli (clean enough)

Tätä projektia kehitetään kevyellä kerrosmallilla:
- UI (React-komponentit)
- Store/ViewModel (MobX)
- Repository/Service (Firebase-adapterit)

Tavoite on erottaa vastuut ilman raskasta kerrosrakennetta.

### 1) Kerrosvastuut
- UI-kerros: renderöinti, käyttäjän syötteet, navigointi.
- Store-kerros: näkymän tila, käyttöliittymään liittyvät muunnokset, komennot UI:lta repoille.
- Repository/Service-kerros: kaikki suorat Firebase/Auth/Firestore-kutsut.

### 2) Riippuvuussääntö
- UI saa riippua storeista.
- Store saa riippua rajapinnoista tai repositoryista.
- Repository saa riippua Firebase-SDK:sta.
- UI ei tee suoria Firebase-kutsuja.

### 3) Minimi ports and adapters
- Määritä tarvittaessa kevyet rajapinnat, kuten `AuthRepository` ja `ReeniRepository`.
- Toteuta Firebase-pohjaiset adapterit repository-kerrokseen.
- Injektoi toteutus storeen konstruktorissa tai RootStore-kokoonpanossa.

### 4) MobX tämän projektin mallissa
- Store toimii presenter/view-model -roolissa.
- Store ei sisällä suoria Firebase-SDK-kutsuja.
- Observable-tila pidetään UI:lle sopivana (`items`, `loading`, `error`, `authUser`).

### 5) Firebase-integraation rajaus
- Kaikki suorat Firebase-kutsut pidetään yhdessä paikassa per vastuualue.
- Auth-tilan muutoksista välitetään storeille vain tarvittava tieto (`uid`, `email`).
- Firestore-polkujen muodostus keskitetään, jotta virheet vähenevät.

### 6) Testattavuus
- Store-logiikka testataan ilman oikeaa Firebasea mockatuilla repositoryilla.
- UI-testit keskittyvät käyttäjävirtoihin.
- E2E-testit käyttävät emulaattoreita (`VITE_USE_EMULATOR=true`).

### 7) Käytännön säännöt tähän repositorioon
- Uusi ominaisuus tehdään järjestyksessä: repository -> store -> UI.
- Komponentit pidetään mahdollisimman tyhminä: ei Firestore-kyselyitä komponenteissa.
- Storeihin lisätään pienet komennot (esim. `loadReenit`, `addReeni`, `logout`) sen sijaan että UI kutsuu infraa suoraan.
- Yksi moduuli, yksi päävastuu.

### 8) Mitä ei tavoitella
- Ei erillistä raskasta domain-kerrosta, jos liiketoimintasäännöt pysyvät yksinkertaisina.
- Ei tarpeettomia abstraktiotasoja "varmuuden vuoksi".
- Ei täydellistä enterprise-cleania pienen sovelluksen kustannuksella.

## Kun Copilot tuottaa koodia tähän projektiin
- Suosi pieniä muutoksia, jotka selkeyttävät kerrosvastuita.
- Siirrä suorat Firebase-kutsut pois UI:sta repository/service-kerrokseen.
- Lisää testit vähintään store-logiikalle ja kriittisille käyttäjävirroille.
- Säilytä olemassa oleva kirjautumis- ja emulaattorikäyttäytyminen.
