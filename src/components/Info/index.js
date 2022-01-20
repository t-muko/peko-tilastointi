import React, { Component } from 'react';
import { observer } from 'mobx-react';
import Typography from '@mui/material/Typography';
import { Paper, Dialog } from '@mui/material';


/*
const styles = {
	container: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		position: 'relative'
	},
	loader: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},
	header: {
		padding: 16,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderBottom: '1px solid #DDD'
	},
	content: {
		flex: 1,
		overflowY: 'scroll'
	}
};
*/



class Info extends Component {

	constructor(props) {
		console.debug("Help construct")
		super(props);

		/*		makeObservable(this, {
					editYhdistys: observable
				})
		*/

	}


	render() {
		console.debug("Render Help")
		return (
			<Dialog open={true} onClose={() => {
				this.props.toggleShowInfoF();
			}
			}
			><Paper sx={{p: 1}}>
				<Typography variant="body1" gutterBottom>PEKO-toimintaa halutaan tilastoida rahoittajaa varten. </Typography>

				<Typography variant="body1" gutterBottom>
					Kellokortin pitäminen pelkkää tilastointia varten on tylsää, joten peko-tilastointi-appiksen ajatus on enemmänkin
					toimia reenipäiväkirjana tai muistiinpanovälineenä mitä milloinkin on tullut tehtyä. Ajatus onkin kääntää tilastointi
					reenaamisen apuvälineeksi.</Typography>

				<Typography variant="body1" gutterBottom>Periaatteet:</Typography>
				<ul>
					<li> kirjautuminen haluamallasi Google-tunnuksella </li>
					<li> kirjaukset näkyvät vain sinulle. Muut eivät näe mitään yksityiskohtia.</li>
					<li> Tunteihin "peko-toimintahyvinvointitunnit". Kokoukset, koulutukset, hallinto kuuluu tunteihin, matkat ei.</li>
					<li> Kategoriat, koiravalinnat helpottavat kun haluat löytää tiedot esimerkiksi mitä jälkitreenejä olet viimeksi tehnyt</li>
					<li> Kategoriajako on tarkoituksella melko korkealla tasolla, jotta käyttö on nopeaa. Valitse kategoria "pääasiallisen" teeman mukaan.
						Muistiinpanoihin voi lisätä tietoja esim. vesistöetsintä, rakennusetsintä jne. Muu reeni -kategoriaa 
						voi käyttää esim. ilmaisutreenien kategoriana.</li>
					<li> Voit niputtaa yhteen merkintään päivän kaikki jutut, tai tehdä useamman merkinnän.
						Tilatoinnissa merkintöjen määrä ei ole mielenkiintoinen, vaan ensisijaiseti tunnit ja ehkä toissijaisesti monenako päivänä viikossa jotain toimintaa tehdään.</li>
					<li> Tämä ei ole valvontaväline, vaan kunkin yksilön oma helppokäyttöinen kirjanpitoväline </li>
					<li> Minimissään halutaan tilastoida vuoden aikana peko-toimintaan käytetyt kokonaistunnit ("hyvinvointia tuottavat tunnit")</li>
					<li> Merkinnöistä voidaan laskea myös eritellympää anynyymia tilastotietoa yhteenvetotasolla, mutta omien reenien avaaminen esim.
						ryhmänjohtajalle tapahtuu vain käyttäjän omasta toimesta vaikkapa printtaamalla halutun suodatetun näkymän merkinnöistä.</li>
					<li> Kaikenlaista yksilöivää tietoa vältetään kuin ruttoa EU:n tietosuoja-asetusta mukaillen</li>
					<li> Tiedot tallennetaan Googlen pilveen Frankfurtiin, eikä niitä käytetä mihinkään muuhun tarkoitukseen, kuin tähän äppiin.</li>
					<li> Palvelu ei tallenna nimeä tai sähköpostiosoitettasi tietojen yhteyteen, vaan tiedot liitetään tekniseen tunnisteeseen (uid).
						Vain ylläpitäjä näkee palveluun kirjautuneet käyttäjät.</li>
				</ul >

				<Typography variant="body1" gutterBottom>
					Vinkki: appi kannattaa kännykässä lisätä kotinäyttöön tms. niin se löytyy helposti.</Typography>

				<Typography variant="body1" gutterBottom>Palvelun tarjoaa Teemu Koivisto teemu@pirkanmaanpelastuskoirat.fi</Typography>
				<Typography variant="body1" gutterBottom>Logon taiteili Kaisa Kuisma</Typography>
			</Paper>
			</Dialog>
			);


	}


}

export default Info;
