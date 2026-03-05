# UI-regressiotestaus

Nykyisessä toteutuksessa ei ole UI-testejä lainkaan. Tarvitsemme
UI-regressiotestauksen, jotta voimme varmistaa, että vanhat ominaisuudet
toimivat edelleen uusien päivitysten jälkeen.

Testien suorittamiseen käytetään Playwrightia, joka on tehokas työkalu
web-sovellusten testaamiseen. Playwright mahdollistaa testien automatisoinnin ja
tarjoaa tukea useille selaimille, mikä varmistaa laajan yhteensopivuuden.

Komponentteihin on hyvä luoda data-test-id -atribuutti, joka helpottaa
elementtien löytämistä testeissä. Tämä auttaa tekemään testeistä luotettavampia
ja vähemmän herkkiä käyttöliittymän muutoksille.

Tavoitteena on luoda kattava testikattavuus tärkeimmille UI-komponenteille ja
-toiminnoille, jotta voimme nopeasti havaita ja korjata regressioita tulevissa
päivityksissä. Tämä parantaa sovelluksen laatua ja käyttäjäkokemusta pitkällä
aikavälillä.

---

## 📋 Suunnittelukommentit ja täsmennykset

### Testausarkkitehtuuri — kaksi tasoa

Sovellus kannattaa testata **kahdella tasolla**, jotka täydentävät toisiaan:

1. **Yksikkö-/komponenttitestit** (nopeat, eristetyt) — Vitest + React Testing
   Library
2. **E2E-regressiotestit** (selainpohjainen, koko sovellus) — Playwright

Näiden lisäksi tarvitaan **Firebase-emulaattori** (paikallinen), jotta testit
eivät käytä oikeaa tuotantotietokantaa.

---

### Taso 1: Komponenttitestit — Vitest + React Testing Library

#### Miksi Vitest eikä Jest?

Projekti käyttää **Vite**-bundleria. Vite ei ole yhteensopiva Jestin kanssa
ilman monimutkaista konfiguraatiota (babel-transform, moduleNameMapper jne.).
**Vitest** on suunniteltu toimimaan Viten kanssa natiiviisti — sama
`vite.config.js`, sama path-alias-konfiguraatio (`@components`, `@stores` jne.)
toimivat suoraan.

> **Huomio:** `package.json`:ssa on jo `@testing-library/react`,
> `@testing-library/jest-dom` ja `@testing-library/user-event` devDependenceinä
> — nämä toimivat sellaisenaan Vitestin kanssa. Ainoastaan Vitest itse puuttuu.

#### Tarvittavat lisäpaketit

```
vitest
@vitest/ui          (valinnainen: selainpohjainen testiraportti)
jsdom               (virtuaalinen DOM Vitestille)
```

#### Mitä mocked/stubbataan komponenttitesteissä?

- **Firebase / Firestore**: Mockataan kokonaan — testit eivät saa tehdä
  verkkopyyntöjä. Firestorter-dokumentit ja -kokoelmat stubbataan palauttamaan
  testidataa.
- **MobX-storet**: Luodaan minimaaliset fake-storet, jotka sisältävät vain
  testin tarvitsemat observable-kentät.
- **Google Auth (`signInWithPopup`)**: Mockataan palauttamaan
  fake-käyttäjäobjekti.

#### Tärkeimmät testattavat komponentit

| Komponentti     | Testattava toiminnallisuus                                  |
| --------------- | ----------------------------------------------------------- |
| `ReeniListItem` | Renderöityminen oikeilla tiedoilla, päivämäärä näkyy oikein |
| `Reenit`        | Hakulaatikko suodattaa listan oikein (AND-logiikka)         |
| `Tilasto`       | Kaaviokomponentti renderöityy kun data saatavilla           |
| `App`           | Login-nappi näkyy kirjautumattomalle, logout kirjautuneelle |

---

### Taso 2: E2E-regressiotestit — Playwright

#### Miksi Playwright?

- Tukee Chromium, Firefox ja WebKit — laaja selainyhteensopivuus yhdellä
  konfiguraatiolla.
- Pystyy odottamaan asynkronisia operaatioita (Firebase-lataukset,
  MobX-reaktiot).
- Sisäänrakennettu testitallennin (`playwright codegen`) helpottaa testien
  luomista.
- Hyvä integroitavuus CI/CD-putkiin (GitHub Actions).

#### Tarvittavat lisäpaketit

```
@playwright/test
```

#### Playwright-testien rakenne

E2E-testit ajetaan kehityspalvelinta (`vite dev`) tai preview-buildia
(`vite preview`) vasten. Firebase-yhteydet ohjataan **Firebase-emulaattoriin** —
ei oikeaan tuotantoon. Tämä tehdään ympäristömuuttujalla:

```
VITE_USE_EMULATOR=true
```

#### Tärkeimmät E2E-skenaariot

1. **Kirjautuminen** — "Kirjaudu Google-tilillä" -nappi löytyy, kirjautumattoman
   käyttäjän näkymä on oikea.
2. **Reeni-listan latautuminen** — Lista näkyy kirjautumisen jälkeen,
   latausindikaattori (CircularProgress) katoaa datan saavuttua.
3. **Hakutoiminto** — Hakulaatikko suodattaa listan oikein, tyhjennä-nappi
   toimii.
4. **Tilasto-välilehti** — Kaavio renderöityy, aikavälin valinta toimii.
5. **Uloskirjautuminen** — Logout-nappi kirjaa ulos ja palauttaa
   kirjautumisnäkymän.

---

### Firebase-emulaattori

Projektin `firebase.json` on jo olemassa. Emulaattorin käynnistys:

```
firebase emulators:start --only firestore,auth
```

Playwright-testit käynnistetään emulaattorin ollessa käynnissä. Testien alustus:
ennen jokaista testitapausta emulaattorin tietokanta tyhjennetään ja täytetään
tunnetulla testidatalla (fixture-data).

---

### `data-testid`-atribuutit — mitä tarvitaan

Playwright löytää elementit mieluiten semanttisten roolien tai
`data-testid`-atribuuttien kautta. Minimissään tarvitaan seuraavat:

| Elementti                     | `data-testid`-arvo    |
| ----------------------------- | --------------------- |
| Kirjaudu-nappi                | `login-button`        |
| Logout-nappi                  | `logout-button`       |
| Hakulaatikko                  | `search-input`        |
| Hakukentän tyhjennysnappi     | `search-clear-button` |
| Reeni-listan yksittäinen rivi | `reeni-list-item`     |
| Latauksen osoitin             | `loading-indicator`   |

---

### Avoimet kysymykset ennen toteutusta

- [x] Käytetäänkö Firebase-emulaattoria myös komponenttitesteissä, vai mockataan
      Firebase kokonaan yksikkötasolla? **Päätös: Firebase mockataan kokonaan
      yksikkötasolla** (ks. `Firebase-mock.md`).
- [x] Ajetaanko E2E-testit oikealla build-versiolla (`vite preview`) vai
      dev-serverillä? Build-versio on realistisempi, mutta hitaampi. **Päätös:
      E2E-testit ajetaan dev-serveriä (`vite dev`) vasten.**
- [x] Onko CI/CD (GitHub Actions) mukana tässä vaiheessa, vai pelkästään
      paikallinen testaus? **Päätös: Pelkästään paikallinen testaus tässä
      vaiheessa.**
- [x] Tarvitaanko visual regression -testaus (screenshot-vertailu), vai riittää
      toiminnallinen regressio? **Päätös: Toiminnallinen regressio riittää, ei
      visual regression -testausta.**

---

## 🚀 Testien ajaminen

### Yksikkötestit (Vitest)

Kaikki yksikkötestit löytyvät `src/components/__tests__/`-kansiosta.

**Aja kaikki testit kerran:**
```bash
npm test
```

**Watch-tila — testit ajetaan automaattisesti muutosten yhteydessä:**
```bash
npm run test:watch
```

**Selainpohjainen Vitest UI (graafinen näkymä tuloksista):**
```bash
npm run test:ui
```

**Yksittäinen testitiedosto:**
```bash
npx vitest run src/components/__tests__/ReeniListItem.test.tsx
```

---

### Olemassa olevat testitiedostot

| Tiedosto | Testejä | Mitä testataan |
|---|---|---|
| `src/components/__tests__/ReeniListItem.test.tsx` | 6 | Päivämäärän formatointi, tuntien näyttö, kategoria, expand-tila |
| `src/components/__tests__/Reenit.test.tsx` | 7 | Hakusuodatus (kategoria, koira, AND-logiikka, vuosi), tyhjennysnappi |


