# Firebasen tietomalli ja mock-toteutukset

Tässä dokumentissa kuvataan sovelluksen Firestore-tietomalli sekä se, miten
Firebase mockataan Vitest-yksikkötestejä varten. Yksikkötesteissä ei käytetä
oikeaa Firebase-yhteyttä eikä emulaattoria — kaikki Firebase-riippuvuudet
korvataan kevyillä mock-toteutuksilla.

---

## Firestore-tietomalli

Sovellus käyttää kahta Firestore-rakennetta.

### 1. `reenit/{uid}/reenit` — harjoituskirjaukset (Collection)

Jokainen käyttäjä omistaa oman alikokoelmansa. Polku vaihtuu kirjautumisen
mukaan (`reeniStore.ts`: `changePath`).

| Kenttä      | Tyyppi  | Arvot / huomiot                                                                                        |
| ----------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `pvm`       | string  | ISO-päivä: `"YYYY-MM-DD"`, esim. `"2024-03-15"`                                                        |
| `tunnit`    | number  | `0, 0.25, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10`                                                |
| `kategoria` | string  | `"Jälki"`, `"Partsa"`, `"Ilmavainu"`, `"Tottis"`, `"Muu reeni"`, `"Muu y-toiminta"`, `"Ei kategoriaa"` |
| `koira`     | string  | `"Ykköskoira"`, `"Kakkoskoira"`, `"Kolmoskoira"`, `"Joku muu"`, `"Ei koiraa"`                          |
| `kommentti` | string  | Vapaa teksti, muistiinpanot                                                                            |
| `yhdistys`  | string  | Jäsenjärjestön nimi (vapaateksti, valitaan listalta)                                                   |
| `finished`  | boolean | Legacy-kenttä, ei enää aktiivisessa käytössä                                                           |

Kokoelma järjestetään aina `pvm` desc -järjestyksessä (`reeniStore.ts`:
`ref.orderBy('pvm', 'desc')`).

**Esimerkki fixture-dokumentista:**

```json
{
    "id": "abc123",
    "pvm": "2024-03-15",
    "tunnit": 1.5,
    "kategoria": "Jälki",
    "koira": "Ykköskoira",
    "kommentti": "Harjoiteltiin puistossa.\nHyvä suoritus.",
    "yhdistys": "Helsingin Palveluskoiraharrastajat ry",
    "finished": false
}
```

---

### 2. `tilastot/{uid}` — tilastotiivistelmä (Document)

Yksittäinen dokumentti per käyttäjä. Kirjoitetaan automaattisesti
`Reenit`-komponentista (MobX-reaktio, 2 s debounce) aina kun harjoitusdata
muuttuu.

```
tilastot/{uid}
  totalH:   number   — kaikki tunnit yhteensä
  totalD:   number   — uniikkien harjoituspäivien määrä yhteensä

  2024:
    sumH:   number   — vuoden 2024 tunnit yhteensä
    sumX:   number   — vuoden 2024 kirjausten määrä
    sumD:   number   — vuoden 2024 uniikkit harjoituspäivät

    Jälki:
      H:    number
      X:    number
    Partsa:
      H:    number
      X:    number
    Ilmavainu: ...
    Tottis: ...
    Muu reeni: ...
    Ei kategoriaa: ...
    Muu y-toiminta: ...

  2023: { ... }   — sama rakenne
  2022: { ... }
  2021: { ... }
```

---

## Mock-toteutukset yksikkötestejä varten

Yksikkötestit mockaavat Firebasen kahdella tasolla:

1. **`firestorter`** — Collection- ja Document-luokat korvataan
   Vitest-mock-luokilla
2. **`firebase/auth`** — auth-funktiot (`onAuthStateChanged`, `signInWithPopup`,
   `signOut`, `getAuth`) korvataan `vi.fn()`-kutsuilla

### Lähestymistapa: `vi.mock()` tiedostotasolla

Testit käyttävät Vitestin `vi.mock()`-mekanismia, joka korvaa moduulin
automaattisesti ennen testin ajoa.

---

### Mock: `firestorter`

Firestorter tarjoaa `Collection`- ja `Document`-luokat, joita käytetään suoraan
komponenteissa (ei storea valvovan palvelun kautta). Mock-luokkien tulee
toteuttaa sama rajapinta, jota komponentit käyttävät.

**Tarvittava rajapinta (`Collection`):**

| Jäsen       | Tyyppi    | Kuvaus                                                         |
| ----------- | --------- | -------------------------------------------------------------- |
| `docs`      | `any[]`   | Dokumenttilista, observable (`isLoading`-tila vaikuttaa tähän) |
| `isLoading` | `boolean` | Ladataanko dataa parhaillaan                                   |
| `query`     | `any`     | Asetetaan järjestysfunktioksi — mock voi jättää huomiotta      |
| `path`      | `string`  | Kokoelman polku                                                |
| `add(data)` | `Promise` | Lisää uuden dokumentin                                         |

**Tarvittava rajapinta (`Document`):**

| Jäsen          | Tyyppi    | Kuvaus                        |
| -------------- | --------- | ----------------------------- |
| `id`           | `string`  | Dokumentin tunnus             |
| `path`         | `string`  | Firestore-polku               |
| `data`         | `object`  | Kenttädata                    |
| `set(data)`    | `Promise` | Korvaa datan                  |
| `update(data)` | `Promise` | Päivittää yksittäisiä kenttiä |
| `delete()`     | `Promise` | Poistaa dokumentin            |

**Ehdotettu mock-toteutus (`src/__mocks__/firestorter.ts`):**

```typescript
import { vi } from "vitest";

export const initFirestorter = vi.fn();

export class Document {
    id: string;
    path: string;
    data: Record<string, any>;

    constructor(path = "", _options?: any) {
        this.path = path;
        this.id = path.split("/").pop() ?? "mock-id";
        this.data = {};
    }

    set = vi.fn().mockResolvedValue(undefined);
    update = vi.fn().mockImplementation(async (fields) => {
        Object.assign(this.data, fields);
    });
    delete = vi.fn().mockResolvedValue(undefined);
}

export class Collection {
    path: string;
    docs: Document[];
    isLoading: boolean;
    query: any;

    constructor(path = "", _options?: any) {
        this.path = path;
        this.docs = [];
        this.isLoading = false;
        this.query = undefined;
    }

    add = vi.fn().mockResolvedValue(new Document(this.path + "/new-doc"));
}
```

Testissä fixture-data asetetaan suoraan `collection.docs`-taulukkoon ennen
renderöintiä:

```typescript
const mockCollection = new Collection("reenit/uid123/reenit");
mockCollection.docs = [
    Object.assign(new Document("reenit/uid123/reenit/abc1"), {
        data: {
            pvm: "2024-03-15",
            tunnit: 1.5,
            kategoria: "Jälki",
            koira: "Ykköskoira",
            kommentti: "Testi",
        },
    }),
];
```

---

### Mock: `firebase/auth`

Auth-toiminnot ovat `firebaseService.ts`-tiedostossa. Testit eivät kirjaudu
oikeasti — mock palauttaa tunnetun käyttäjäobjektin.

**Tarvittavat mock-funktiot:**

| Funktio              | Mitä mockataan                                                 |
| -------------------- | -------------------------------------------------------------- |
| `getAuth`            | Palauttaa fake auth-objektin                                   |
| `onAuthStateChanged` | Kutsuu callbackin välittömästi fake-käyttäjällä tai `null`:lla |
| `signInWithPopup`    | Palauttaa `Promise.resolve({ user: fakeUser })`                |
| `signOut`            | Palauttaa `Promise.resolve()`                                  |
| `GoogleAuthProvider` | Tyhjä mock-luokka                                              |

**Ehdotettu mock-toteutus (`src/__mocks__/firebase-auth.ts`):**

```typescript
import { vi } from "vitest";

export const fakeUser = {
    uid: "test-uid-123",
    displayName: "Testi Käyttäjä",
    email: "testi@example.com",
    photoURL: null,
};

export const getAuth = vi.fn(() => ({ languageCode: "" }));

export const onAuthStateChanged = vi.fn((_auth, callback) => {
    callback(fakeUser); // Kirjautunut käyttäjä oletuksena
    return vi.fn(); // Palauttaa unsubscribe-funktion
});

export const signInWithPopup = vi.fn().mockResolvedValue({ user: fakeUser });
export const signOut = vi.fn().mockResolvedValue(undefined);

export class GoogleAuthProvider {}
```

Testeissä, joissa pitää simuloida kirjautumaton tila, `onAuthStateChanged`
mockataan palauttamaan `null`:

```typescript
vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth, cb) => {
    cb(null);
    return vi.fn();
});
```

---

### Mock: `firebase/compat/app`

`Reenit.tsx` importoi `@components/Firebase/Firebase`, joka importoi
`Firebase`-luokan `firebaseService.ts`:stä. Tässä tiedostossa
`firebase.initializeApp()` kutsutaan **moduulitasolla** (ei konstruktorissa),
mikä tarkoittaa, että se suoritetaan aina kun tiedosto ladataan — myös
testeissä.

Tämän vuoksi `firebase/compat/app` täytyy mockata testeissä, joissa importoidaan
`@components/Firebase/Firebase`. Mock estää oikeat verkkoyhtydet ja alustuksen:

```typescript
vi.mock("firebase/compat/app", () => ({
    default: {
        initializeApp: vi.fn().mockReturnValue({}),
        apps: [],
    },
}));
vi.mock("firebase/compat/auth", () => ({}));
vi.mock("firebase/compat/firestore", () => ({}));
```

---

## Yhteenveto: toteutetut tiedostot

| Tiedosto                                          | Tarkoitus                                                   |
| ------------------------------------------------- | ----------------------------------------------------------- |
| `vitest.config.ts`                                | Vitest-konfiguraatio (jsdom, path-aliakset, setup-tiedosto) |
| `src/test/setup.ts`                               | `@testing-library/jest-dom`-matchereiden rekisteröinti      |
| `src/components/__tests__/ReeniListItem.test.tsx` | ReeniListItem-renderöintitestit                             |
| `src/components/__tests__/Reenit.test.tsx`        | Reenit-hakusuodatustestit                                   |

---

## Päätökset

- [x] Mock-tyyli: **eksplisiittinen `vi.mock()`** jokaisessa testitiedostossa —
      ei automaattisia `__mocks__`-kansioita.
- [x] MobX-observablet toimivat testeissä sellaisenaan — Vitest + jsdom tukee
      MobX:ää ilman lisäkonfiguraatiota.
- [x] `firebase/compat/app` täytyy mockata testeissä, joissa komponentti
      importoi `@components/Firebase/Firebase` (moduulitason sivuvaikutus).
