# Suunnitelma: Hashtag-tilastot kommenteista (paikallinen MVP)

**Tila:** Luonnos  
**Päivämäärä:** 2026-03-06  
**Liittyvät tiedostot:** [src/components/Reenit.tsx](../src/components/Reenit.tsx), [src/components/Tilasto.tsx](../src/components/Tilasto.tsx), [src/components/ReeniItem.tsx](../src/components/ReeniItem.tsx)

---

## Tavoite

Käyttäjä voi merkitä reenikommentteihin hashtageja (esim. `#myown`, `#laviini`). Tilastonäkymässä näytetään uusi piirakkakuvaaja, jossa omien reenikirjausten hashtag-jakauma visualisoidaan.

Tässä vaiheessa hashtag-tilasto on **täysin paikallinen**:
- lasketaan aina näkymässä olevista käyttäjän vuoden reeneistä
- ei kirjoiteta eikä lueta hashtag-tilastoa Firebasesta

---

## 1. Datamalli (paikallinen, ei tietokantaa)

Hashtag-jakauma muodostetaan ajonaikaisena rakenteena `Tilasto.tsx`:ssä.

```ts
type HashtagStats = Record<string, { H: number; X: number }>;
```

Esimerkki ajonaikaisesta datasta:

```json
{
  "myown": { "H": 18.5, "X": 8 },
  "laviini": { "H": 6, "X": 3 },
  "kilpailu": { "H": 4, "X": 2 }
}
```

Lähdedata tähän saadaan suoraan `reeniFirestore.reenit.docs`-listasta, rajattuna valittuun vuoteen ja kirjautuneeseen käyttäjään (nykyinen polku on jo käyttäjäkohtainen).

---

## 2. Hashtag-parserin säännöt

Luodaan uusi tiedosto **`src/utils/hashtag.ts`**, joka sisältää puhtaan funktion `parseHashtags(kommentti: string): string[]`.

### Hyväksyttävät merkit

- Hashtag alkaa `#`-merkillä.
- Tag koostuu kirjaimista (a-z, å, ä, ö, A-Z, Å, Ä, Ö), numeroista (0-9) ja yhdysmerkistä (`-`).
- Minimipituus: vähintään 1 merkki `#`-merkin jälkeen.
- Maksimipituus: enintään 30 merkkiä.

Hyväksytyt esimerkit: `#myown`, `#laviini`, `#kilpailu-2025`, `#ä12`  
Hylätyt esimerkit: `#` (tyhjä), `#foo bar` (välilyönti katkaisee), `https://example.com/#fragment`.

### Normalisointi ja duplikaatit

- Kaikki hashtagit muutetaan pieniksi kirjaimiksi (`toLowerCase()`).
- Yhden reenikirjauksen sisällä sama hashtag lasketaan vain kerran (Set).

### URL-osumien välttäminen

- Parseri jättää huomiotta URL-fragmentin kaltaiset osumat.

---

## 3. Laskenta UI:ssa

### Periaate

Hashtag-tilasto lasketaan paikallisesti `Tilasto.tsx`:ssä samalla render-kierroksella, kun valittu vuosi ja yksikkö (`H`/`X`) tunnetaan.

Suositus: eriytetään laskenta omaan apufunktioon:
- `src/utils/hashtagStats.ts`
- `buildHashtagStats(reenit, tilastoVuosi): HashtagStats`

### Laskentasäännöt

1. Rajaa `reeniFirestore.reenit.docs` valitun vuoden riveihin (`pvm` sisältää vuoden).
2. Poimi kommentista hashtagit parserilla.
3. Laske per hashtag:
- `X`: +1 per reeni, jos hashtag esiintyy reenin kommentissa
- `H`: +`tunnit` (tai 0 jos puuttuu)
4. Järjestä avaimet vakaaseen järjestykseen ennen chart-dataa.

Huomio: tämä laskenta ei muuta `tilastot/{uid}`-dokumenttia eikä muuta nykyistä tilastokirjoitusta.

---

## 4. Tilasto.tsx: uusi piirakkakuvaaja

### Sijoitus

Uusi `<Chart>` lisätään `Tilasto.tsx`:ään nykyisten kuvaajien yhteyteen.

### Datan rakentaminen

1. Laske `hashtagStats` paikallisesti vuoden reeneistä.
2. Lajittele tagit valitun yksikön (`H`/`X`) mukaan laskevaan järjestykseen.
3. Näytä top-N (ehdotus N=8) ja yhdistä loput "Muut"-lohkoksi.
4. Muodosta Google Charts -yhteensopiva `chartData`.

### Tyhjän datan käsittely

- Jos hashtageja ei ole, kuvaajaa ei renderöidä.
- Näytetään teksti: "Ei hashtag-merkintöjä vuodelle {tilastoVuosi}".

### Yksikkövalinta

Sama olemassa oleva `this.yksikko` (`H`/`X`) ohjaa myös hashtag-kuvaajaa.

---

## 5. Testisuunnitelma

### 5a. Yksikkötestit parserille

**Tiedosto:** `src/utils/__tests__/hashtag.test.ts`

Testaa mm.:
- perusosumat
- case-normalisointi
- duplikaatit
- tyhjä teksti
- URL-fragmentit
- erikoismerkit

### 5b. Yksikkötestit hashtag-laskennalle

**Tiedosto:** `src/utils/__tests__/hashtagStats.test.ts`

Testaa mm.:
- oikeat `H`- ja `X`-summat
- saman reenin duplikaatti-hashtag lasketaan kerran
- reeni ilman `tunnit`-arvoa
- vuoden rajaus toimii

### 5c. Komponenttitestit Tilasto-näkymälle

**Tiedosto:** `src/components/__tests__/Tilasto.test.tsx`

Testaa mm.:
- kuvaaja näkyy kun dataa on
- fallback-teksti näkyy kun dataa ei ole
- top-N + "Muut" muodostuu oikein
- `H`/`X`-vaihto päivittää dataa

### 5d. E2E (myöhemmin)

**Tiedosto:** `tests/e2e/hashtag-tilastot.spec.ts`

Peruspolku:
1. Lisää reeni kommentilla `#myown`.
2. Avaa tilasto.
3. Varmista, että hashtag-kuvaaja on näkyvissä.

---

## 6. Vaiheistus

### MVP-vaihe

1. `src/utils/hashtag.ts` - parseri.
2. `src/utils/hashtagStats.ts` - paikallinen aggregointi.
3. `src/components/Tilasto.tsx` - uusi hashtag-piirakka + fallback.
4. Testit parserille ja aggregoinnille.

### Vaihe 2

1. Hashtagin klikkaus suodattimeksi reenilistaan.
2. Ehdottelu kommenttikenttään aiemmin käytetyistä tageista.
3. Mahdollinen tallennus/aggregate myöhemmin, jos suorituskyky tai raportointi sitä edellyttää.

---

## 7. Riskit ja mitigoinnit

### R1: Laskenta renderissä kasvattaa kuormaa

Riski: jos rivejä on paljon, jokainen render tekee parseri- ja aggregointityötä.

Mitigointi:
- Eristä laskenta apufunktioon.
- Memoisoi laskenta vuosi + docs -avainparilla, jos tarpeen.

### R2: Epätasainen hashtag-käyttö

Riski: kaikki kommentit eivät sisällä hashtageja, jolloin kuvaaja on usein tyhjä.

Mitigointi:
- Selkeä fallback-teksti.
- Kevyt ohjeteksti Info-näkymään hashtagien käytöstä.

### R3: Regex-virheosumat

Riski: URL-fragmentit tai poikkeavat merkit voivat tulla mukaan.

Mitigointi:
- Testit URL- ja reunatapauksille.
- Parserin sääntöjen pitäminen yksinkertaisina.

---

## Tiedostopolkuyhteenveto

| Tiedosto | Muutos |
|---|---|
| [src/utils/hashtag.ts](../src/utils/hashtag.ts) | Uusi - `parseHashtags(text)` |
| [src/utils/hashtagStats.ts](../src/utils/hashtagStats.ts) | Uusi - `buildHashtagStats(reenit, vuosi)` |
| [src/components/Tilasto.tsx](../src/components/Tilasto.tsx) | Muokataan - paikallinen hashtag-kuvaaja |
| `src/utils/__tests__/hashtag.test.ts` | Uusi - parseritestit |
| `src/utils/__tests__/hashtagStats.test.ts` | Uusi - aggregointitestit |
| `src/components/__tests__/Tilasto.test.tsx` | Uusi - kuvaajan testit |

---

## Avoimet valinnat

1. Top-N: 8 vai 10?
2. Näytetäänkö "Muut" aina, vai vasta kun yli 1 tagi jää ulos?
3. Haluatko MVP:hen pienen ohjetekstin (`Info.tsx`) tyyliin: "Voit merkitä omia kategorioita hashtageilla, esim. #myown"?
