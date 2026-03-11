# ajokilometrit-laajennus

> **Suunnittelupalaute (10.3.2026)**
> Alkuperäinen teksti säilyy alla kursivointina. Alla on analyysit, täydennykset ja ehdotettu rakenne seuraavaa TDD-vaihetta varten.

---

## Alkuperäinen kuvaus (muuttamaton)

> *reeniItemiin lisätään kenttä 'ajokilometrit' lyhennettynä 'akm'. nämä lasketaan myös yhteen ei-pakolliseen vuositilastokenttään 'akm', sekä ajokilometrien keskiarvo kenttään 'keskiakm'*
> *Jos ajokilometrejä ei ole, niin tilastoonkaan ei niitä tallenneta. 0 = undefined myös reeniItemissä.*
>
> *Tilastosivulle lasketaan tekstiriville keskiarvo, yhteensä ja ajokilometrit raportoineiden käyttäjien määrä tilastovuonna.*

---

## Löydökset ja avoimet kysymykset

## Päätetyt linjaukset (10.3.2026)

- `akm`-tilastot (`akm` yhteensä ja `keskiakm`) lasketaan vuositilastoon ja tallennetaan `setTilastoRecord`-funktiolla.
- Tilastodokumentin polku pysyy ennallaan: `tilastot/{uid}` (ei polkumuutosta).
- Arvoa `0` ei tallenneta dokumenttiin. Kenttä jätetään kokonaan pois (`akm` puuttuu dokumentista).
- Käyttöliittymässä kenttä voidaan näyttää tyhjänä (`km`), jos arvoa ei ole. Nolla voidaan syöttää, mutta koska `0` normalisoidaan pois tallennuksessa, seuraavalla latauksella kenttä näkyy taas tyhjänä, jos arvo puuttuu dokumentista.
- Kaikki laskenta tehdään clientissä.
- Käyttäjien määrä tarkoittaa niiden käyttäjien määrää, jotka ovat tehneet vähintään yhden `akm`-merkinnän kyseisenä vuonna. Se ei tarkoita kirjausten lukumäärää.
- `firestore.rules` päivitetään niin, että `reeni`-dokumentin `akm`-kenttä validoidaan (valinnainen, kokonaisluku, > 0).
- Vastuunjako: client laskee tilastotiedot, `setTilastoRecord` päivittää tilastorekordin ja tallennus tehdään olemassa olevaan tilastodokumenttiin polussa `tilastot/{uid}`.

### 🔴 Kriittiset puutteet

1. **Tietomalli täsmennetty**
   - `akm` ja `keskiakm` tallennetaan olemassa olevaan käyttäjäkohtaiseen tilastodokumenttiin polussa `tilastot/{uid}`.
   - Tilasto on käyttäjäkohtainen, ei globaali.

2. **"0 = undefined" -käyttäytyminen täsmennetty UI:ssa**
   - Jos arvo puuttuu dokumentista, kenttä näytetään tyhjänä.
   - Arvo `0` hyväksytään syötteenä, mutta tallennuksessa `0` normalisoidaan puuttuvaksi kentäksi.
   - Seuraavalla latauksella kenttä näkyy tyhjänä, jos arvoa ei ole dokumentissa.

3. **Tilastolaskennan vastuunjako täsmennetty**
   - Laskenta (`akm`, `keskiakm`, käyttäjämäärä) tehdään client-puolella.
   - Päivitetty tilastorekordi välitetään `setTilastoRecord`-funktion kautta ja tallennetaan nykyiseen tilastodokumenttiin.

4. **"Raportoivien käyttäjien määrä" on epämääräinen**
   - Tarkoitetaanko: kuinka monen käyttäjän kirjauksissa on `akm > 0` kyseiseltä vuodelta?
   - Vai kirjausten lukumäärä, joissa `akm` on annettu?

### 🟡 Tärkeät täydennykset

5. **`ReeniData`-rajapintaan (`reeniRepository.ts`) tarvitaan muutos** – `akm?: number` lisättävä.
6. **`addDefaultReeni` (`reeniStore.ts`)** – oletusarvo `akm`:lle? Ei lisätä vai `undefined`?
7. **UI-komponentti (`ReeniItem.tsx`)** – miten kenttä esitetään? Numerokenttä, yksikkö (km), pakollinen vai valinnainen?
8. **Tilastosivu (`Tilasto.tsx`)** – missä kohtaa sivua uusi rivi näytetään, kenen datasta (kaikki vai kirjautunut käyttäjä)?

### 🟢 Arkkitehtuurihuomiot

9. **Kerrosvastuu**: Laskentalogiikka (`akm`-summa, keskiarvo, käyttäjämäärä) kuuluu store- tai utility-kerrokseen, ei komponenttiin. Vrt. `hashtagStats.ts`-malli.
10. **Firestore-indeksointi**: Jos tilastokysely tehdään vuoden mukaan, tarvitaanko `firestore.indexes.json`-päivitys?

---

## Hyväksymiskriteerit (ehdotettu)

Ominaisuus on valmis, kun:

- [ ] `ReeniItem`-lomakkeessa on valinnainen `ajokilometrit`-kenttä (kokonaisluku, yksikkö km)
- [ ] Arvo `0` tai tyhjä ei tallennu Firestoreen (`akm`-kenttä jätetään pois dokumentista)
- [ ] Jos `akm` puuttuu dokumentista, kenttä näytetään käyttöliittymässä tyhjänä
- [ ] Arvo `0` voidaan syöttää käyttöliittymässä ilman virhettä
- [ ] Kirjauksen muokkaus toimii: aiemmin tallennettu `akm` näkyy kentässä, poistaminen mahdollista
- [ ] Tilastosivulla näkyy tilastovuoden ajokilometrit-rivi: yhteensä, keskiarvo ja raportoineiden käyttäjien määrä
- [ ] Rivi piilotetaan, jos yhdelläkään kirjauksella ei ole `akm`-arvoa valitulta vuodelta
- [ ] Tilastokirjoitus (`akm`, `keskiakm`) tapahtuu vuositilastoon `setTilastoRecord`-funktiolla
- [ ] `firestore.rules` sisältää `akm`-validoinnin `reeni`-dokumentille
- [ ] Olemassa olevat reeniStore- ja tilasto-testit menevät läpi muutosten jälkeen

---

## Tietomalli (vahvistettava)

### `ReeniData` (kirjaus Firestoreen)

```
{
  pvm: string,
  tunnit: number,
  kommentti: string,
  kategoria: string,
  koira: string,
   akm?: number   // <- UUSI, kokonaisluku, tallennetaan vain jos > 0
}
```

### Tilastodokumentti

Polku: `tilastot/{uid}` (ei muutosta)

```
{
  // ...olemassa olevat kentät...
  akm?: number,       // ← UUSI: ajokilometrit yhteensä tilastovuonna
  keskiakm?: number   // ← UUSI: kirjausten keskiarvo (vain akm-kirjaukset)
}
```

> **Päätös**: `akm` ja `keskiakm` tallennetaan `setTilastoRecord`-funktiolla olemassa olevaan dokumenttiin `tilastot/{uid}`.

---

## Laskentalogiikka (ehdotettu)

Laskenta tapahtuu **client-puolella store/utility-kerroksessa** (vrt. `buildHashtagStats`-malli):

`akm` käsitellään aina kokonaislukuna. Syöte validoidaan niin, että desimaalit eivät ole sallittuja.

1. Suodata kirjaukset, joissa `akm > 0` ja `pvm` kuuluu tilastovuoteen
2. `akm_yhteensa = sum(akm)` näistä kirjauksista
3. `keskiakm = akm_yhteensa / akm_kirjausten_lkm`
4. `raportoivien_kayttajien_lkm = unique(uid where akm > 0 in tilastovuosi)`
5. Tallennus Firestoreen vuositilastodokumenttiin `setTilastoRecord`-funktiolla

`0` ja tyhjä arvo normalisoidaan `undefined`:ksi ennen tallennusta, jolloin `akm`-kenttää ei kirjoiteta dokumenttiin. Tämän vuoksi latauksessa puuttuva `akm` näkyy UI:ssa tyhjänä kenttänä.

---

## Toteutusjärjestys (TDD-vaiheita varten)

Suositeltu järjestys arkkitehtuuriohjeistuksen mukaisesti (repository → store → UI):

1. **Laajenna `ReeniData`-rajapinta** – lisää `akm?: number`
2. **Kirjoita utility-funktio** ajokilometritilastojen laskentaan (malli: `buildHashtagStats`)
3. **Laajenna store** – lisää lasketut kentät / komento tilastokirjoitukseen
4. **Päivitä `ReeniItem`-komponentti** – lisää `akm`-kenttä lomakkeelle
5. **Päivitä `Tilasto`-komponentti** – lisää ajokilometrit-rivi
6. **E2E-testi** – kirjaa reeni ajokilometreillä, tarkista tilastosivu

---

## Avoimet päätökset (ennen toteutusta)

| # | Kysymys | Vaihtoehto A | Vaihtoehto B |
|---|---------|-------------|-------------|
| 1 | Tilastodokumentin polku | `tilastot/{uid}` (ei muutosta) | Paatetty |
| 2 | Tilastolaskennan sijainti | Client-puoli | Paatetty |
| 3 | "0 = undefined" kayttaytyminen | Kentta jateaan pois dokumentista | Paatetty |
| 4 | Kayttajien maara | Uniikit kayttajat, joilla `akm > 0` vuonna | Paatetty |
| 5 | `firestore.rules` | `akm`-validointi lisattava `reeni`-dokumenttiin | Paatetty |