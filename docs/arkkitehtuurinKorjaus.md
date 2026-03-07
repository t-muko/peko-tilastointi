# Arkkitehtuurin korjaukset

## Tila 2026-03-07

Taman dokumentin kohdat 1.1-1.4 ovat nyt toteutettuja korjauksia, eivat avoimia poikkeamia.

Toteutettu nykytila:
- Firebase-init on keskitetty tiedostoon `src/components/Firebase/firebaseApp.ts` funktion `getOrCreateFirebaseApp()` taakse.
- `RootStore` alustaa `reeniFirestore`-storen ennen `firebase`-servicea.
- Auth-callbackissa `user.getIdToken()` on `try/catch`-suojattu ja `changePath(...)` ajetaan myos virhetilanteessa.
- `sessionStore.userOk` riippuu vain `authUser`-tilasta.
- UI:n add-toiminto kayttaa store-komentoa `addDefaultReeni()`.
- `ReeniFireStorter` kayttaa repository-abstraktiota (`ReeniRepository` + `FirestorterReeniRepository`).

> **Historiallinen osio alkaa alta.**
> Alla oleva analyysi kuvaa tilannetta ennen korjausten toteutusta ja sailytetaan taustadokumentaationa.

---

## 1. Historiallinen nykytilanne (ennen korjauksia)

README:ssä tunnistettiin neljä poikkeamaa tavoitellusta arkkitehtuurista. Alla on täydennetty analyysi havainnoista.

### 1.1 Firebase-initialisointi on hajautettu useaan paikkaan

**Tiedostot:** `src/components/Firebase/firebaseService.ts`, `src/stores/reeniStore.ts`

`firebaseConfig`-objekti ja `firebase.initializeApp()`-kutsu esiintyvät sekä `firebaseService.ts`:ssä (moduulitasolla **ja** konstruktorissa) että `reeniStore.ts`:n konstruktorissa. Käytännössä samaa Firebase-applikaatiota yritetään alustaa useasti, mikä on virhealtista ja johtaa helposti "app already initialized" -poikkeuksiin ajoympäristöstä riippuen.

### 1.2 UI tekee suoria infrastruktuurikutsuja

**Tiedosto:** `src/components/App.tsx`

`App.tsx` kutsuu suoraan `rootStore.reeniFirestore.reenit.add(...)` (Firestorter `Collection`-metodi). UI-kerros rikkoo riippuvuussääntöä: komponentti tuntee Firestore-kokoelman sisäisen rakenteen eikä käytä store-komentoa. Tämä tekee toiminnallisuuden testaamisesta hankalaa ja sitoo UI:n Firebase-toteutukseen.

### 1.3 Store- ja infravastuut sekoittuvat reeniStoressa

**Tiedosto:** `src/stores/reeniStore.ts`

`ReeniFireStorter`-luokka sisältää sekä Firestorter-alustuksen (`initFirestorter`), Firebase-konfiguraation, että kokoelmaoperaatiot. Store-kerroksen ei tulisi tuntea Firebase SDK:ta suoraan. Tähän tarvitaan erillinen repository/service-kerros.

### 1.4 `use-stores.ts` ei käytä React-kontekstia oikein

**Tiedosto:** `src/hooks/use-stores.ts`

Tiedostossa kutsutaan `React.useContext(rootStore as any)`, jossa `rootStore` on tavallinen ES-moduulivienti eikä `React.Context`-olio. Tämä ei toimi oikein ja on tyypitetty `any`-kiertoratkaisulla. Projektin storejen virallinen kulutuspolku komponenteille on epäselvä: osa komponenteista käyttää `FirebaseContext.Consumer`:ia, osa potentiaalisesti tätä hookia.

---

## 2. Historialliset loydokset priorisoituna

### 🔴 Kriittinen

#### Firebase alustetaan useaan kertaan
- **Miksi kriittinen:** Duplikaatti-`initializeApp`-kutsu voi aiheuttaa ajonaikaisen virheen. Firebase SDK heittää poikkeuksen jos samalla nimellä alustetaan toistamiseen. Tämä on myös tietoturvaongelma: API-avain on kovakoodattuna kahdessa paikassa, jolloin päivitys vain toiseen luo epäsynkronin.
- **Kohde:** `reeniStore.ts` kokonaisuudessaan; `firebaseService.ts` moduulitason kutsu.

---

### 🟠 Korkea

#### UI kutsuu infraa suoraan (`App.tsx`)
- **Miksi korkea:** Rikkoo kerrosarkkitehtuurin ydinperiaatteen. Uuden reeni-merkinnän lisääminen ei ole testattavissa ilman Firestore-instanssia, eikä toiminnallisuutta voi siirtää tai muuttaa koskematta UI-koodiin.
- **Kohde:** `App.tsx` — `onPressAdd`-metodi.

#### Store ja Firestore-infra ovat samassa luokassa
- **Miksi korkea:** `ReeniFireStorter` on samaan aikaan store (pitää dataa) ja repositorio (tekee Firestore-kutsuja). Testausohjeissa mainittu "store-logiikka testataan ilman oikeaa Firebasea" ei toteudu tällä hetkellä.
- **Kohde:** `reeniStore.ts` — Firestorter-alustus ja kokoelmaoperaatiot.

---

### 🟡 Keskitaso

#### `use-stores.ts` ei käytä kontekstia oikein
- **Miksi keskitaso:** Koodi toimii nykyisellään vain sattumalta tai hookin käyttämättömyyden vuoksi. Jos hookia aletaan käyttää laajemmin, se ei palauta storeja. Yhtenäinen konventio storejen käyttöön puuttuu.
- **Kohde:** `src/hooks/use-stores.ts`.

---

## 3. Historiallinen korjausjarjestys ja vaiheistus

Korjaukset tehdään pienissä, testattavissa vaiheissa. Jokainen vaihe on itsenäisesti toimitettavissa.

### Vaihe 1 — Firebase-alustuksen keskittäminen
**Tavoite:** Yksi paikka, jossa Firebase alustetaan. Konfiguraatio luetaan ympäristömuuttujista (tai säilytetään yhdessä tiedostossa).

**Periaate:**
- Luo erillinen Firebase-alustusmooduli (esim. `src/firebase/init.ts`), josta sekä `firebaseService.ts` että Firestorter-integraatio saavat alustuneen `app`-instanssin.
- Poista duplikaatti `firebaseConfig` ja `initializeApp`-kutsut muista tiedostoista.

**Hyväksymisehto:** `firebase.initializeApp()` kutsutaan täsmälleen kerran koko sovelluksen elinkaaren aikana. Yksikkötestit eivät kaadu "already initialized" -virheeseen.

---

### Vaihe 2 — Repository-kerroksen lisääminen reeniStoreen
**Tavoite:** `reeniStore.ts` saa esimerkiksi `ReeniRepository`-rajapinnan, jonka tuotantototeutus käyttää Firestorteria ja testitoteutus on mock.

**Periaate:**
- Määrittele kevyt `ReeniRepository`-rajapinta (operaatiot: `add`, `changePath` / `setUser`, kokoelman observointi).
- Siirrä Firestorter-sidokset erilliseen adapteriin.
- `ReeniFireStorter`-store injektoi repositoryn konstruktorissa.

**Hyväksymisehto:** `reeniStore.ts` ei importoi Firebase SDK:ta eikä Firestorteria suoraan. Store-logiikka on testattavissa mock-repositoryllä.

---

### Vaihe 3 — Storekomento `addReeni` App.tsx:n tilalle
**Tavoite:** `App.tsx` kutsuu `reeniStore.addReeni(data)` eikä tiedä Firestorterista mitään.

**Periaate:**
- Lisää `addReeni(data)`-metodi `ReeniFireStorter`-storen julkiseen rajapintaan.
- Siirrä `onPressAdd`-logiikka storeen.
- `App.tsx` kutsuu vain komentoa.

**Hyväksymisehto:** `App.tsx` ei importoi eikä käytä Firestore/Firestorter-tyyppejä suoraan. Komponenttitesti pystyy mockaamaan storen.

---

### Vaihe 4 — `use-stores.ts`-hooki korjataan tai poistetaan
**Tavoite:** Selkeä, yksi virallinen tapa kuluttaa storeja komponenteissa.

**Vaihtoehdot (valitaan yksi):**
- **A) Poistetaan `use-stores.ts`** ja käytetään ainoastaan `FirebaseContext.Consumer` / `useContext(FirebaseContext)` -konventiota.
- **B) Korjataan hookiksi**, joka käyttää oikeaa `FirebaseContext`-kontekstia ja palauttaa `rootStore`-olion.

**Hyväksymisehto:** Kaikki komponentit käyttävät samaa mekanismia storejen hakemiseen. `as any` -kiertoratkaisuja ei ole `use-stores.ts`:ssä.

---

## 4. Historialliset testattavuustavoitteet

| Korjaus | Mitä pitäisi voida testata |
|---|---|
| Vaihe 1 | Firebase alustuu kerran; mock toimii ilman SDK:ta |
| Vaihe 2 | `addReeni`, `changePath` toimivat mock-repositorylla (Vitest) |
| Vaihe 3 | `App.tsx` `onPressAdd`-logiikka testattavissa ilman Firestorea |
| Vaihe 4 | `useStores()` palauttaa oikean storen kontekstitestissä |

---

## 5. Historialliset rajaukset

- Ei täydellistä domain-kerrosta; liiketoimintasäännöt pysyvät yksinkertaisina.
- Ei muuteta Firestorter-kirjastosta pois siirtymistä tässä yhteydessä (se on erillinen, isompi päätös).
- Ei muuteta olemassa olevan autentikointi- tai emulaattorikäyttäytymisen logiikkaa.
- Ei refaktoroida muita komponentteja kuin ne, joita korjaukset suoraan koskevat.

---

> **Paivitys:** TDD-vaiheet on toteutettu tassa repossa. Tata dokumenttia pidetaan jatkossa historiallisena kuvauksena korjausten taustasta.
