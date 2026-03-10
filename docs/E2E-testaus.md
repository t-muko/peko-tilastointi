# E2E-testaus — Playwright + Firebase-emulaattori

Tämä dokumentti kuvaa E2E-testauksen arkkitehtuurin, tarvittavat muutokset
sovellukseen ja testiskenaariot. Testit ajetaan oikeassa Chromium-selaimessa
paikallista dev-serveriä (`vite dev`) vasten. Firebase-yhteys ohjataan
paikalliseen emulaattoriin — ei tuotantoon.

---

## Arkkitehtuurikuva

```
┌─────────────────────┐     ┌──────────────────────────┐
│  Playwright          │────▶│  vite dev (localhost:5173)│
│  (Chromium)          │     │  VITE_USE_EMULATOR=true   │
└─────────────────────┘     └──────────┬───────────────┘
                                        │
                             ┌──────────▼───────────────┐
                             │  Firebase Emulator Suite  │
                             │  Auth:      localhost:9099│
                             │  Firestore: localhost:8080│
                             └──────────────────────────┘
```

Komponentit renderöityvät oikeassa selaimessa ja tekevät oikeita kutsuja
emulaattoriin — mutta eivät koskaan tuotantoon.

---

## Miksi emulaattori eikä vi.mock()?

Playwright-testit ajavat oikeaa selainta, joten Vitestin `vi.mock()` ei toimi
siellä. Vaihtoehto olisi rakentaa sovellukseen `VITE_USE_MOCK`-tila, mutta se
vaatisi muutoksia tuotantokoodiin ja ylläpitääkseen erillistä mock-kerrosta.

Firebase-emulaattori on puhtaampi ratkaisu: se käyttäytyy kuten oikea Firebase,
mutta on täysin paikallinen ja nollataan testien välissä.

---

## Tarvittavat paketit

```bash
pnpm add -D @playwright/test
npx playwright install chromium
```

---

## Tarvittavat muutokset sovellukseen

### 1. Emulaattoriyhteys `firebaseService.ts`:iin

Kun `VITE_USE_EMULATOR=true`, sovelluksen tulee yhdistää emulaattoriin
tuotantopalvelujen sijaan. Muutos tehdään konstruktoriin:

```typescript
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

constructor(rootStore: RootStore) {
    // ... olemassa oleva koodi ...

    if (import.meta.env.VITE_USE_EMULATOR === 'true') {
        connectAuthEmulator(this.auth, 'http://localhost:9099', { disableWarnings: true });
        const db = getFirestore(this.app);
        connectFirestoreEmulator(db, 'localhost', 8080);
    }
}
```

### 2. Emulaattorit `firebase.json`:iin

Firebase CLI:n emulaattorikonfiguraatio lisätään `firebase.json`-tiedostoon:

```json
"emulators": {
  "auth": { "port": 9099 },
  "firestore": { "port": 8080 },
  "ui": { "enabled": true }
}
```

### 3. Ympäristömuuttuja `.env.test`

Erillinen `.env.test`-tiedosto testejä varten (ei commitoida):

```
VITE_USE_EMULATOR=true
```

---

## Auth-haaste: Google OAuth ei toimi emulaattorissa

Google OAuth -popup (`signInWithPopup`) ei toimi emulaattorissa, koska se vaatii
oikean Googlen OAuth-virran. Ratkaisu: **Firebase Auth Emulator REST API**,
jolla luodaan testitunnuksia suoraan ilman popupia.

Playwright-testin `setup`-vaiheessa luodaan testikäyttäjä REST-kutsulla:

```typescript
// tests/helpers/emulator.ts

const AUTH_EMULATOR = "http://localhost:9099";
const PROJECT_ID = "peko-tilastointi";

export async function createTestUser(email: string, password: string) {
    const res = await fetch(
        `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        },
    );
    return res.json(); // palauttaa { idToken, localId, ... }
}

export async function clearEmulatorData() {
    await fetch(
        `http://localhost:8080/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
        { method: "DELETE" },
    );
    await fetch(
        `${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/accounts`,
        { method: "DELETE" },
    );
}
```

Sovellus kirjataan sisään Playwright-testissä `signInWithEmailAndPassword`:lla
(ei popupilla), joka toimii emulaattorin kanssa.

**Päätös:** Lisätään `firebaseService.ts`:iin erillinen metodi
`autentikoiTestissa(email, password)`, jota kutsutaan vain kun
`VITE_USE_EMULATOR=true`. Olemassa oleva `autentikoi()`-metodi (Google OAuth
popup) pysyy muuttumattomana tuotantokäyttöä varten.

```typescript
// firebaseService.ts — lisäys konstruktorin jälkeen
autentikoiTestissa(email: string, password: string) {
    if (import.meta.env.VITE_USE_EMULATOR !== 'true') {
        throw new Error('autentikoiTestissa() on käytettävissä vain emulaattori-tilassa');
    }
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    return signInWithEmailAndPassword(this.auth, email, password);
}
```

Playwright-testi kutsuu tätä metodia `page.evaluate()`:n kautta, koska
kirjautuminen tapahtuu selaimen Firebase SDK:ssa eikä Playwright-prosessissa:

```typescript
// tests/e2e/helpers/auth.ts
export async function loginAsTestUser(page: Page) {
    await page.evaluate(async ({ email, password }) => {
        const rootStore = (window as any).__rootStore;
        await rootStore.firebase.autentikoiTestissa(email, password);
    }, { email: "testi@test.com", password: "test1234" });
}
```

> **Huomio:** `window.__rootStore` edellyttää, että `RootStore` eksportoidaan
> development/test-tilassa `window`-objektiin. Lisätään `src/index.tsx`:iin:
>
> ```typescript
> if (import.meta.env.VITE_USE_EMULATOR === "true") {
>     (window as any).__rootStore = rootStore;
> }
> ```

---

## Testidatan hallinta

Ennen jokaista testitapausta (`beforeEach`):

1. Emulaattorin Firestore ja Auth nollataan (`clearEmulatorData()`)
2. Luodaan testikäyttäjä
3. Täytetään Firestore fixture-datalla suoraan Admin SDK:n tai REST APIn kautta

Fixture-data (`tests/fixtures/reenit.ts`) sisältää tunnetun joukon
harjoituskirjauksia, joita vasten testit ajetaan. Näin testit ovat
deterministisiä riippumatta siitä, mitä emulaattorissa on aiemmin ollut.

**Päätös: Fixture-data kirjoitetaan Firestore REST APIn kautta** — ei
lisäriippuvuuksia. Firestore Emulator tarjoaa REST-rajapinnan suoraan:

```typescript
// tests/e2e/helpers/emulator.ts
const FIRESTORE_EMULATOR = "http://localhost:8080";
const PROJECT_ID = "peko-tilastointi";

export async function seedReenit(uid: string, docs: object[]) {
    for (const doc of docs) {
        await fetch(
            `${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/reenit/${uid}/reenit`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields: toFirestoreFields(doc) }),
            },
        );
    }
}
```

`toFirestoreFields()` muuntaa plain JS -objektin Firestore REST APIn odottamaan
muotoon (`{ "pvm": { "stringValue": "2024-03-15" }, ... }`).

---

## Testiskenaariot

### Skenaariot, jotka toteutetaan ensimmäisessä vaiheessa

| Skenaario              | Mitä testataan                                |
| ---------------------- | --------------------------------------------- |
| Kirjautumaton käyttäjä | Login-nappi näkyy, reeni-lista ei näy         |
| Kirjautuminen          | Kirjautuminen onnistuu, reeni-lista latautuu  |
| Reeni-lista näkyy      | Fixture-data renderöityy oikein               |
| Hakusuodatus           | Hakulaatikko suodattaa, tyhjennysnappi toimii |
| Uloskirjautuminen      | Logout palauttaa kirjautumisnäkymän           |

### Myöhemmässä vaiheessa

| Skenaario           | Mitä testataan                                     |
| ------------------- | -------------------------------------------------- |
| Uuden reenin lisäys | FAB-nappi avaa lomakkeen, tallennus näkyy listalla |
| Reenin muokkaus     | Edit-nappi avaa dialogin, muutos tallentuu         |
| Reenin poisto       | Delete-nappi poistaa rivin listalta                |
| Tilasto-näkymä      | Accordion avautuu, kaavio renderöityy              |

---

## Playwright-konfiguraatio (`playwright.config.ts`)

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    use: {
        baseURL: "http://localhost:5173",
        headless: true,
    },
    // Käynnistää dev-serverin automaattisesti ennen testejä
    webServer: {
        command: "npm run dev:test", // vite dev --mode test
        url: "http://localhost:5173",
        reuseExistingServer: false,
    },
});
```

`package.json`-skriptit:

```json
"dev:test":    "vite --mode test",
"test:e2e":    "playwright test",
"test:e2e:ui": "playwright test --ui"
```

---

## Päätökset

- [x] **Kirjautumistapa:** Lisätään `autentikoiTestissa(email, password)`
      -metodi `firebaseService.ts`:iin. Kutsutaan vain kun
      `VITE_USE_EMULATOR=true`. `RootStore` eksportoidaan
      `window.__rootStore`:iin test-tilassa, jotta Playwright pääsee käsiksi
      siihen `page.evaluate()`:n kautta.
- [x] **Fixture-data:** Kirjoitetaan Firestore Emulator REST APIn kautta — ei
      lisäriippuvuuksia.
