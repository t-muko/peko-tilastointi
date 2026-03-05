import React, { Component } from 'react';
import { observer } from 'mobx-react';
import Typography from '@mui/material/Typography';
import { Paper, Dialog } from '@mui/material';

interface InfoProps {
	toggleShowInfoF: () => void;
}

class Info extends Component<InfoProps> {

	render() {
		return (
			<Dialog open={true} onClose={() => {
				this.props.toggleShowInfoF();
			}
			}
			><Paper sx={{ p: 1 }}>
					<Typography variant="h4" gutterBottom>Ohjeita ja infoa</Typography>
					<Typography variant="body1" gutterBottom>PEKO-toimintaa halutaan tilastoida rahoittajaa varten. </Typography>

					<Typography variant="body1" gutterBottom>
						Kellokortin pitäminen pelkkää tilastointia varten on tylsää, joten peko-tilastointi-appiksen ajatus on enemmänkin
						toimia reenipäiväkirjana tai muistiinpanovälineenä mitä milloinkin on tullut tehtyä. Ajatus onkin kääntää tilastointi
						reenaamisen apuvälineeksi.</Typography>

					<Typography variant="h5" gutterBottom>Periaatteet:</Typography>
					<ul>
						<li> Kirjautuminen haluamallasi Google-tunnuksella </li>
						<li> Kirjaukset näkyvät vain sinulle. Muut eivät näe mitään yksityiskohtia.</li>
						<li> Tunteihin "peko-toimintahyvinvointitunnit". Kokoukset, koulutukset, hallinto kuuluu tunteihin, matkat ei.</li>
						<li> Kategoriat, koiravalinnat helpottavat kun haluat löytää tiedot esimerkiksi mitä jälkitreenejä olet viimeksi tehnyt</li>
						<li> Kategoriajako on tarkoituksella melko korkealla tasolla, jotta käyttö on nopeaa. Valitse kategoria "pääasiallisen" teeman mukaan.
							Muistiinpanoihin voi lisätä tietoja esim. vesistöetsintä, rakennusetsintä jne. Muu reeni -kategoriaa
							voi käyttää esim. ilmaisutreenien kategoriana.</li>
						<li> Voit niputtaa yhteen merkintään päivän kaikki jutut, tai tehdä useamman merkinnän.
							Tilatoinnissa merkintöjen määrä ei ole mielenkiintoinen, vaan ensisijaiseti tunnit ja ehkä toissijaisesti monenako päivänä viikossa jotain toimintaa tehdään.</li>
						<li> Tämä ei ole valvontaväline, vaan kunkin yksilön oma helppokäyttöinen kirjanpitoväline - <i>rakas päiväkirja...</i></li>
						<li> Minimissään halutaan tilastoida vuoden aikana peko-toimintaan käytetyt kokonaistunnit ("hyvinvointia tuottavat tunnit")</li>
						<li> Merkinnöistä lasketaan anynyymia tilastotietoa yhteenvetotasolla, mutta omien reenien avaaminen esim.
							ryhmänjohtajalle tapahtuu vain käyttäjän omasta toimesta vaikkapa printtaamalla halutun suodatetun näkymän merkinnöistä.</li>
						<li> Kaikenlaista yksilöivää tietoa vältetään kuin ruttoa EU:n tietosuoja-asetusta mukaillen</li>
						<li> Tiedot tallennetaan Googlen pilveen Frankfurtiin, eikä niitä käytetä mihinkään muuhun tarkoitukseen, kuin tähän äppiin.</li>
						<li> Palvelu ei tallenna nimeä tai sähköpostiosoitettasi tietojen yhteyteen, vaan tiedot liitetään tekniseen tunnisteeseen (uid).
							Vain ylläpitäjä näkee palveluun kirjautuneet käyttäjät.</li>
					</ul >

					<Typography variant="h5" gutterBottom>Kategorioista</Typography>
					<Typography variant="body1" gutterBottom>
						Valitse kategoria sen mukaan, mikä oli harjoituksen/toiminnan pääasiallinen tarkoitus.
					</Typography>

					<Typography variant="body1" gutterBottom>
						Kategoriajako on tarkoituksella melko karkea, jotta käyttö on nopeaa eikä sopivaa kategoriaa tarvitse
						miettiä liian pitkään. Toki uskottavan tilaston kannalta olisi hyvä että kategoriaoita käytetään suht koht samalla tavalla
						Kategoriat ovat sinua varten ja toivottavasti toimivat harjoittelun tukena. </Typography>

					<Typography variant="body1" gutterBottom>
						Pelastuskoiran perustyökalut ovat ilmavainutyöskentely ja
						jälkityöskentely. Näitä harjoitellaan erilaisissa ympäristöissä.
						Ohjaajan kannalta taas tärkeä on sokkoharjoitus, jossa sovelletaan kaikkea opittua. Tämä kategoria on nimetty lyhyesti
						'partsa'-nimellä. Tällä ei siis viitata koeohjeen partiointiin.</Typography>

					<Typography variant="body1" gutterBottom>Merkitse muistiinpanoihin haluamasi tarkenteet. Nämä löytyvät hakutoiminnolla, jolloin
						pystyt helposti tarkistamaan että montako kertaa on tullut taajamaetsintää harjoiteltua. Taajamassa reenataan todennäköisesti joko
						koiran ilmavainutyöskentelyä tai sitten partsaa eli koiran reaktioiden lukemista. Rakennusetsintä taas on todennäköisesti ilmavainutyöskentelyä.
					</Typography>

					<Typography variant="body1" gutterBottom>
						Muu reeni -kategoriaan menee esimerkiksi ilmaisun harjoittelu, esine-etsintä jne.
					</Typography>

					<Typography variant="body1" gutterBottom>
						Tarkoitus on saada kattava kuva toiminnasta, joten mukana on myös muu yhdistystoiminta (muu y-toiminta), eli
						kokeiden järjestelyt, kokoukset, kurssit, hallinto jne.
					</Typography>

					<Typography variant="body1" gutterBottom>
						Hakutoiminto osaa päivien ja kuukausien nimet. Jos haluat löytää vuoden 2026 kesäkuun jälkireenit, kirjoita hakutermiksi "kesäkuu 2026 jälki".
						Kommenteista vuoden 2026 nostot löytyvät kirjoittamalla hakusanaksi "nosto 2026".
					</Typography>

					<Typography variant="h5" gutterBottom>Vinkki</Typography>
					<Typography variant="body1" gutterBottom>
						Appi kannattaa kännykässä lisätä kotinäyttöön tms. niin se löytyy helposti.</Typography>

					<Typography variant="body1" gutterBottom>Palvelun tarjoaa Teemu Koivisto teemu@pirkanmaanpelastuskoirat.fi</Typography>
					<Typography variant="body1" gutterBottom>Logon taiteili Kaisa Kuisma</Typography>
				</Paper>
			</Dialog>
		);


	}


}

export default Info;
