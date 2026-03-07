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
- `sessionStore`: säilyttää kirjautuneen käyttäjän (`authUser`) ja tarjoaa `userOk`-tilan (riippuu vain auth-tilasta).
- `messageStore`: yleinen viestitila ja listamuunnos (`messageList`).
- `reeniFirestore` (`ReeniFireStorter`): store, joka kayttaa `ReeniRepository`-rajapintaa harjoitusmerkintojen lukuun ja kirjoitukseen.
- `firebase`: Firebase-palveluluokka autentikointiin ja auth-tilan seurantaan.

Nykyinen datavirta:
1. `RootStore` alustaa `reeniFirestore`-storen ennen `firebase`-servicea, jotta auth-callbackissa tarvittava store on valmiina.
2. `Firebase` kuuntelee auth-tilaa (`onAuthStateChanged`).
3. `sessionStore.setAuthUser(...)` paivittaa kirjautumisen tilan.
4. Jos kayttaja on kirjautunut, `user.getIdToken()` kutsutaan `try/catch`-lohkon sisalla ennen polun vaihtoa.
5. `reeniFirestore.changePath(...)` vaihtaa Firestore-polun aina: `reenit/{uid}/reenit` tai uloskirjautuneena `reenit/anonyymi/reenit`.
6. UI (`App.tsx` ja muut komponentit) renderoi nakyman `sessionStore.userOk`-tilan perusteella.

### Firebase autentikointi
Autentikointi toteutetaan tiedostossa `src/components/Firebase/firebaseService.ts`.

Toteutuksen pääkohdat:
- Firebase-app alustetaan keskitetysti tiedoston `src/components/Firebase/firebaseApp.ts` funktion `getOrCreateFirebaseApp()` kautta.
- Google-kirjautuminen: `signInWithPopup(this.auth, this.provider)`.
- Uloskirjautuminen: `signOut(this.auth)`.
- Auth-tilan kuuntelu: `onAuthStateChanged(...)`.
- Auth-callbackissa `user.getIdToken()` on suojattu `try/catch`-lohkoon, ja Firestore-polku vaihdetaan myos virhetilanteessa.
- Testi/emulaattorituki:
- `VITE_USE_EMULATOR === 'true'` kytkee Auth- ja Firestore-emulaattorit.
- `autentikoiTestissa(email, password)` on tarkoitettu vain emulaattoritilaan.

### Firebase käyttö (Firestore)
Firestorea kaytetaan Firestorter-kirjaston kautta repository-kerroksessa.

Keskeiset tiedostot:
- `src/stores/repositories/reeniRepository.ts` (rajapinta)
- `src/stores/repositories/firestorterReeniRepository.ts` (Firestorter-toteutus)
- `src/stores/reeniStore.ts` (store, joka delegoi repositorylle)

Pääperiaate:
- Oletuspolku on anonyymi: `reenit/anonyymi/reenit`.
- Kirjautumisen jalkeen polku vaihtuu muotoon `reenit/{uid}/reenit`.
- Kyselyt jarjestetaan kentan `pvm` mukaan laskevasti.
- Uusia merkintoja lisataan store-komentojen kautta (`addReeni`, `addDefaultReeni`).

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
- `ReeniRepository` on kaytossa rajapintana (`src/stores/repositories/reeniRepository.ts`).
- Firebase/Firestorter-pohjainen adapteri on `FirestorterReeniRepository`.
- Toteutus injektoidaan `ReeniFireStorter`-storeen konstruktorissa (oletuksena Firestorter-adapteri).

### 4) MobX tämän projektin mallissa
- Store toimii presenter/view-model -roolissa.
- Store ei sisällä suoria Firebase-SDK-kutsuja.
- Observable-tila pidetään UI:lle sopivana (`items`, `loading`, `error`, `authUser`).

### 5) Firebase-integraation rajaus
- Firebase-appin alustus pidetaan keskitettyna `firebaseApp.ts`-tiedostossa.
- Auth-tilan muutoksista valitetaan storeille vain tarvittava tieto (`authUser`) ja polunvaihto tehdan palvelukerroksessa.
- Firestore-polun muodostus keskitetaan auth-callbackiin (`uid` tai `anonyymi`).

### 6) Testattavuus
- Store-logiikka testataan ilman oikeaa Firebasea mockatuilla repositoryilla.
- UI-testit keskittyvät käyttäjävirtoihin.
- E2E-testit käyttävät emulaattoreita (`VITE_USE_EMULATOR=true`).

### 7) Käytännön säännöt tähän repositorioon
- Uusi ominaisuus tehdään järjestyksessä: repository -> store -> UI.
- Komponentit pidetään mahdollisimman tyhminä: ei Firestore-kyselyitä komponenteissa.
- Storeihin lisataan pienet komennot (esim. `addReeni`, `addDefaultReeni`, `changePath`) sen sijaan etta UI kutsuu infraa suoraan.
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
