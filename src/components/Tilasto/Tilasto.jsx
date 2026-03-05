import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { makeObservable, observable, action } from 'mobx';
import { FirebaseContext } from '../Firebase';
import { Collection, Document } from 'firestorter';
import { CircularProgress } from "@mui/material";
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { TextField } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';

import { Paper, Dialog } from '@mui/material';
import { Chart } from "react-google-charts";

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import moment from 'moment';
import 'moment/locale/fi';
moment.locale('fi')

const jasenjarjestot = [
	{ label: '' },
	{ label: 'Action ry' },
	{ label: 'Action Dogs' },
	{ label: 'Aktiivicolliet ry' },
	{ label: 'Aktiivikoirat ry' },
	{ label: 'Anjalankosken Palveluskoirayhdistys ry' },
	{ label: 'Askola Country Dogs ry' },
	{ label: 'Australianpaimenkoirat ry' },
	{ label: 'Bullenbeisser-Klubi ry' },
	{ label: 'Bullmastiffit ja Mastiffit ry' },
	{ label: 'Cane Corso Club Finland ry' },
	{ label: 'Citybelgit ry' },
	{ label: 'Close-Knit Team ry' },
	{ label: 'Dalmatiankoirat ry' },
	{ label: 'Dobermann Team Turku ry' },
	{ label: 'Dogo Argentino Club Finland ry' },
	{ label: 'Espoon Koirakerho ry' },
	{ label: 'Espoon Palveluskoiraklubi ry' },
	{ label: 'Etelä-Hämeen Rottweilerkerho ry' },
	{ label: 'Etelä-Pirkanmaan Pelastuskoirat EPPeko ry' },
	{ label: 'Etelä-Pohjanmaan Koiraklubi ry' },
	{ label: 'Etelä-Suomen Palveluskoira ry' },
	{ label: 'Etelä-Suomen Ruttukuonokerho' },
	{ label: 'Forssan Palveluskoirat' },
	{ label: 'Haapaveden Kennelseura ry' },
	{ label: 'Hakunilan Seudun Koiraharrastajat ry' },
	{ label: 'Hangö Kennelklubb rf - Hangon Kennelkerho ry' },
	{ label: 'Hankasalmen Kennelkerho ry' },
	{ label: 'Harjavallan Palvelus- ja Seurakoiraharrastajat ry' },
	{ label: 'Hausjärven Haukut ry' },
	{ label: 'Heinolan Palvelus- ja Seurakoira ry' },
	{ label: 'Helsingin Palveluskoiraharrastajat ry' },
	{ label: 'Helsingin Vetokoirakerho ry' },
	{ label: 'Helsingin Väestönsuojeluyhdistys/HEPeKo' },
	{ label: 'H H Haku Hurtat ry' },
	{ label: 'Hiiden Haukut ry' },
	{ label: 'Hollolan Koiraharrastajat ry' },
	{ label: 'Huittisten Seudun Koirayhdistys ry' },
	{ label: 'Hundklubben Koirakerho Canidae ry' },
	{ label: 'Hyvinkään Käyttökoirat ry' },
	{ label: 'Hämeen Hakukoirat ry' },
	{ label: 'Hämeenlinnan Etsintäkoirat ry' },
	{ label: 'Hämeenlinnan Kennelkerho ry' },
	{ label: 'Iisalmen Seudun Käyttö- ja Seurakoirayhdistys ry' },
	{ label: 'Imatran Palveluskoirayhdistys ry' },
	{ label: 'Impivaaran Hallit ry' },
	{ label: 'Ipo-Klubi ry' },
	{ label: 'Jalasjärven Koiraharrastajat ry' },
	{ label: 'Joensuun Seudun Palveluskoirayhdistys ry' },
	{ label: 'Jokelan Seudun Koirakerho ry' },
	{ label: 'Joutsan Koiraharrastajat ry' },
	{ label: 'Jämsän Seudun Palveluskoiraharrastajat ry' },
	{ label: 'Järvenpään Koirakerho ry' },
	{ label: 'Kaakon Käyttökoirat ry' },
	{ label: 'Kaarinan Koiraharrastajat ry' },
	{ label: 'Kainuun Palveluskoirayhdistys ry' },
	{ label: 'Kanavan Koirakilta ry' },
	{ label: 'Kangasniemen Kennelkerho ry' },
	{ label: 'Kankaanpään Seudun Kennelyhdistys ry' },
	{ label: 'Kannuksen Koiruudet ry' },
	{ label: 'Karjalan Palveluskoiraharrastajat ry' },
	{ label: 'Kauhajoen Koiraharrastajat ry' },
	{ label: 'Kauhavan Kennelkerho ry' },
	{ label: 'Kaustisenseudun Koiraharrastajat ry' },
	{ label: 'Kemin Seura- ja Palveluskoirakerho ry' },
	{ label: 'Keravan Koiraharrastajat ry' },
	{ label: 'Keski-Karjalan Palveluskoirat ry' },
	{ label: 'Keski-Pohjanmaan Palveluskoirat ry' },
	{ label: 'Keski-Suomen Palveluskoirayhdistys ry' },
	{ label: 'Keuruun Seudun Kennelkerho ry' },
	{ label: 'Kirkkonummen Kennelkerho ry' },
	{ label: 'Kiteen Kennelkerho ry' },
	{ label: 'Koillismaan Koirakerho ry' },
	{ label: 'Koirakerho Tassut ry' },
	{ label: 'Kouvolan Palveluskoirayhdistys ry' },
	{ label: 'Kouvolan Pelastuskoirat ry' },
	{ label: 'Kristiinanseudun Koiraharrastajat ry' },
	{ label: 'Kukkian Haukut' },
	{ label: 'Kultainen Rengas - Golden Ring ry' },
	{ label: 'Kuopion Palvelus- ja Seurakoiraharrastajat ry' },
	{ label: 'Kuopion Pelastuskoirat ry' },
	{ label: 'Kymen Vetokoiraseura ry' },
	{ label: 'Kyrönmaan Koiraharrastajat' },
	{ label: 'Kyröskosken Käyttökoirat ry' },
	{ label: 'Labradorinnoutajakerho ry' },
	{ label: 'Lahden Käyttökoira ry' },
	{ label: 'Lappalaiskoirat ry' },
	{ label: 'Lappeenrannan Palveluskoirayhdistys ry' },
	{ label: 'Lapuan Koiraharrastajat ry' },
	{ label: 'Lempäälän-Vesilahden Koirakerho (LeVeK) ry' },
	{ label: 'Leppävirran Palvelus- ja Seurakoiraharrastajat ry' },
	{ label: 'Lieksan Palveluskoirakerho ry' },
	{ label: 'Lohjan Palvelus- ja Pelastuskoirayhdistys ry' },
	{ label: 'Lohtajan Palveluskoiraharrastajat ry' },
	{ label: 'Lounais-Hämeen Kennelkerho ry' },
	{ label: 'Luoteis-Uudenmaan Käyttökoirat ry' },
	{ label: 'Mikkelin Palveluskoirayhdistys ry' },
	{ label: 'Mondioring ITU ry' },
	{ label: 'Mondioring Kotka ry' },
	{ label: 'Mondioringyhdistys ry' },
	{ label: 'Mäntsälän Koirakerho ry' },
	{ label: 'Mäntän Seudun Palveluskoirat ry' },
	{ label: 'Nokian Palveluskoiraharrastajat ry' },
	{ label: 'Novascotiannoutajat ry' },
	{ label: 'Nu-Pun Koiraklubi ry' },
	{ label: 'Nurmeksen Seudun Kennelkerho ry' },
	{ label: 'Opaskoirayhdistys ry' },
	{ label: 'Orimattilan Kennelkerho ry' },
	{ label: 'Oriveden Seudun Koirakerho ry' },
	{ label: 'Oulujokilaakson Kennelkerho ry' },
	{ label: 'Oulun Koirakerho ry' },
	{ label: 'Oulun Palveluskoirayhdistys ry' },
	{ label: 'Ounasjokilaakson Kennelkerho ry' },
	{ label: 'Outokummun Kennelseura ry' },
	{ label: 'Palveluskoirayhdistys Kotikenttä ry' },
	{ label: 'Parkanon Seudun Palveluskoirakerho ry' },
	{ label: 'Pieksämäen Palveluskoirayhdistys ry' },
	{ label: 'Pielisen Aktiivikoirat ry' },
	{ label: 'Pietarsaaren Seudun Kennelseura ry' },
	{ label: 'Piilonkiertäjät ry' },
	{ label: 'Pirkanmaan Käyttökoirayhdistys ry' },
	{ label: 'Pirkanmaan Palveluskoiraharrastajat ry' },
	{ label: 'Pirkanmaan Pelastuskoirat ry' },
	{ label: 'Pohjanmaan PK-klubi ry' },
	{ label: 'Pohjanmaan Rottweilerkerho ry' },
	{ label: 'Pohjois-Karjalan Käyttökoirat ry' },
	{ label: 'Pohjois-Karjalan Pelastuskoirat ry' },
	{ label: 'Pohjois-Lapin Koirakerho ry' },
	{ label: 'Pohjois-Pohjanmaan Urheilu- ja Työkoirat ry' },
	{ label: 'Pohjois-Savon Rottweilerkerho ry' },
	{ label: 'Pondera Team ry' },
	{ label: 'Porin Palveluskoirakerho ry' },
	{ label: 'Porvoon Palveluskoirat ry' },
	{ label: 'Porvoonseudun Koiraharrastajat ry' },
	{ label: 'Pumit ry' },
	{ label: 'Punkaharjun Koirat ry' },
	{ label: 'Päijäthoffit ry' },
	{ label: 'Pure Dogs ry' },
	{ label: 'Raahen Koirakerho ry' },
	{ label: 'Rannikon rakit ry' },
	{ label: 'Rauman Käyttö- ja Seurakoirat ry' },
	{ label: 'Riihimäen Seudun Kennelkerho ry' },
	{ label: 'Rovaniemen Käyttökoirat ry' },
	{ label: 'Rovaniemen Palveluskoirakerho ry' },
	{ label: 'Saarijärven Käyttökoirat ry' },
	{ label: 'Saksanpaimenkoiraliitto ry' },
	{ label: 'Salon Seudun Palveluskoiraharrastajat ry' },
	{ label: 'Sarplaninac Club Finland ry' },
	{ label: 'Satakunnan Pelastuskoirat ry' },
	{ label: 'Savonlinnan Kennelkerho ry' },
	{ label: 'Savonlinnan Palveluskoirayhdistys ry' },
	{ label: 'Seinäjoen Kennelkerho ry' },
	{ label: 'Siilinjärven-Maaningan Pelastuskoirat ry' },
	{ label: 'Sodankylän Karvakuonot ry' },
	{ label: 'Someron Seudun Koiraharrastajat ry' },
	{ label: 'SPL Ala-Satakunta ry' },
	{ label: 'SPL Etelä-Oulu ry' },
	{ label: 'SPL Etelä-Pohjanmaa ry' },
	{ label: 'SPL Etelä-Uusimaa ry' },
	{ label: 'SPL Forssa ry' },
	{ label: 'SPL Helsinki ry' },
	{ label: 'SPL Imatra ry' },
	{ label: 'SPL Itä-Helsinki ry' },
	{ label: 'SPL Itä-Pirkanmaa ry' },
	{ label: 'SPL Itä-Uusimaa ry' },
	{ label: 'SPL Jokela ry' },
	{ label: 'SPL Kanta-Häme ry' },
	{ label: 'SPL Kemi ry' },
	{ label: 'SPL Keski-Suomi ry' },
	{ label: 'SPL Kotka ry' },
	{ label: 'SPL Kouvola ry' },
	{ label: 'SPL Kuopio ry' },
	{ label: 'SPL Kurikka ry' },
	{ label: 'SPL Kuusjoki ry' },
	{ label: 'SPL Kärkölä ry' },
	{ label: 'SPL Lahti ry' },
	{ label: 'SPL Lapinlahti ry' },
	{ label: 'SPL Länsi-Häme ry' },
	{ label: 'SPL Länsi-Uusimaa ry' },
	{ label: 'SPL Merenkurkku ry' },
	{ label: 'SPL Nurmijärvi ry' },
	{ label: 'SPL Oulu ry' },
	{ label: 'SPL Pietarsaarenseutu ry' },
	{ label: 'SPL Pohjois-Karjala ry' },
	{ label: 'SPL Pori ry' },
	{ label: 'SPL Porvoo ry' },
	{ label: 'SPL Raahe ry' },
	{ label: 'SPL Rauma ry' },
	{ label: 'SPL Rovaniemi ry' },
	{ label: 'SPL Röykkä ry' },
	{ label: 'SPL Saimaa ry' },
	{ label: 'SPL Savo-Karjala ry' },
	{ label: 'SPL Seinäjoki ry' },
	{ label: 'SPL Tampere ry' },
	{ label: 'SPL Turku ry' },
	{ label: 'SPL Wasa ry' },
	{ label: 'Sport Riesen Klub ry' },
	{ label: 'Suomenselän Palveluskoirat ry' },
	{ label: 'Suonenjoen Palvelus- ja Seurakoiraharrastajat ry' },
	{ label: 'Tampereen Palveluskoiraharrastajat ry' },
	{ label: 'Tampereen Vetokoiraseura ry' },
	{ label: 'Team Working Dogs ry' },
	{ label: 'Teiskon Tahto Tassut ry' },
	{ label: 'TervaNuuskut' },
	{ label: 'Toijalan Seudun Koirakerho ry' },
	{ label: 'T.O.P K-9 ry' },
	{ label: 'T-Team Sport Dogs ry' },
	{ label: 'Turun Kenttäkoirayhdistys ry' },
	{ label: 'Turun Käyttökoirakerho ry' },
	{ label: 'Turun Palveluskoiraharrastajat ry' },
	{ label: 'Tuuloksen Koirakerho' },
	{ label: 'Tuusulan Kennelkerho ry' },
	{ label: 'TVA Pori ry' },
	{ label: 'Tyrnävän koiraharrastajat ry' },
	{ label: 'Ulvilan Palveluskoirat ry' },
	{ label: 'Uudenmaan Harrastuskoirat ry' },
	{ label: 'Uudenmaan Vetokoiraurheilijat ry' },
	{ label: 'Vaasan Seudun Palveluskoiraharrastajat ry' },
	{ label: 'Vakka-Suomen Kennelkerho' },
	{ label: 'Vakka-Suomen Palveluskoiraharrastajat ry' },
	{ label: 'Valkeakosken Kennelkerho ry' },
	{ label: 'Vammalan Palveluskoiraharrastajat ry' },
	{ label: 'Vantaan Etsintäkoirat' },
	{ label: 'Vantaan Palveluskoirayhdistys ry' },
	{ label: 'Vantaa SAR Dogs ry' },
	{ label: 'Varkauden Palvelus- ja Seurakoirat ry' },
	{ label: 'Varsinaiset Hoffit' },
	{ label: 'Veikkolan Koirakerho ry' },
	{ label: 'Vesikoirat ry' },
	{ label: 'Western Finland Ring Club ry' },
	{ label: 'Working Dobermann Club ry' },
	{ label: 'Ylöjärven Koirakerho ry' },
	{ label: 'Ylöjärven Käyttöhukat ry' },
	{ label: 'Ålands Bruks- och Sällskapshundklubb' }
]

// const flatProps = {
// 	options: jasenjarjestot.map((option) => option.label),
// };

/*const data = [
	["Task", "Hours per Day"],
	["Work", 11],
	["Eat", 2],
	["Commute", 2],
	["Watch TV", 2],
	["Sleep", 7],
];*/

/*const options = {
	title: "Merkintöjen jakauma",
	pieSliceText: "value"
};*/

const Tilasto = observer(class Tilasto extends Component {

	yhteensa = null
	editYhdistys = false
	yksikko = "X"
	tilastoVuosi = (new Date()).getFullYear()

	static contextType = FirebaseContext

	constructor(props) {
		super(props);

		makeObservable(this, {
			editYhdistys: observable,
			yksikko: observable,
			tilastoVuosi: observable,
			vaihdaVuosi: action,
			vaihdaYksikko: action,
			closeYhdistysEdit: action,
			openYhdistysEdit: action
		})

		this.tilastotColl = new Collection('tilastot');


	}

	componentWillMount() {
		this.uid = this.context.rootStore.sessionStore.authUser.uid
		this.tilastoDokumentti = new Document('tilastot/' + this.uid);

	}

	vaihdaYksikko = (event) => {
		this.yksikko = event.target.value
	}

	vaihdaVuosi = (event) => {
		this.tilastoVuosi = event.target.value
	}

	openYhdistysEdit = (event) => {
		this.editYhdistys = true
	}

	closeYhdistysEdit = (event) => {
		this.editYhdistys = false
	}

	render() {
		const context = this.context
		if (!context.rootStore.sessionStore.userOk) {
			console.log('Tilastot.render, disabled. Bad path/user');
			return (
				<div>
				</div>
			);
		} else {
			const yksikko = this.yksikko
			const tilastoVuosi = this.tilastoVuosi

			const kuluvaVuosi = (new Date()).getFullYear()
			const range = (start, stop, step = 1) =>
				Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)
			const vuodet = range(2021, kuluvaVuosi + 1, 1)

			const { docs: tilastoDocs, isLoading: isTilastoLoading } = this.tilastotColl;
			const tilastoVuodenKaikkiTilastot = tilastoDocs
			.filter((tilasto) => tilasto.data[tilastoVuosi]).map((tilasto) => tilasto.data[tilastoVuosi])
			.filter((tilasto) => tilasto.sumH > 0)
			const tilastovuoden_tunnit_yhteensa = tilastoVuodenKaikkiTilastot.map((tilasto) => tilasto.sumH || 0).reduce((a, b) => a + b, 0)
			const tilastovuoden_paivat_yhteensa = tilastoVuodenKaikkiTilastot.map((tilasto) => tilasto.sumD || 0).reduce((a, b) => a + b, 0)


			const yhdistyksenTilastoDocs = tilastoDocs.filter((row) => (row.data.yhd || '') === this.tilastoDokumentti.data.yhd)
			const yhdistys_yhteensa = yhdistyksenTilastoDocs.map((tilasto) => tilasto.data[tilastoVuosi] ? tilasto.data[tilastoVuosi].sumH : 0).reduce((a, b) => a + b, 0)
			const kuluvanVuodenTilastot = yhdistyksenTilastoDocs.filter((tilasto) => tilasto.data[tilastoVuosi]).map((tilasto) => tilasto.data[tilastoVuosi]).filter((tilasto) => tilasto.sumH > 0)

			const yhdistykset = new Set()
			tilastoDocs.filter((tilasto) => tilasto.data[tilastoVuosi] !== undefined).map((tilasto) => yhdistykset.add(tilasto.data.yhd))

			if (kuluvanVuodenTilastot.length > 1) {
				const byCat = new Object()
				const kategoriat = ['Jälki', 'Partsa', 'Ilmavainu', 'Tottis', 'Muu reeni', 'Ei kategoriaa', 'Muu y-toiminta']
				kategoriat.forEach((cat) => byCat[cat] = kuluvanVuodenTilastot
					.map((tilasto) => (tilasto[cat][yksikko]))
					.reduce((p, c) => p + c, 0)
				)

				var chartDataYhd = [['Kategoria', 'Kerrat']]
				chartDataYhd = chartDataYhd.concat(Object.entries(byCat).map(([key, value]) => ([key, Math.round(value)])))
				
			}
			else {
				var chartDataYhd = [['Kategoria', 'Kerrat']]
			}
			

			if (tilastoDocs.length > 1) {
				const byCat = new Object()
				const kategoriat = ['Jälki', 'Partsa', 'Ilmavainu', 'Tottis', 'Muu reeni', 'Ei kategoriaa', 'Muu y-toiminta']
				kategoriat.forEach((cat) => byCat[cat] = tilastoDocs
					.filter((tilasto) => tilasto.data[tilastoVuosi])
					.map((tilasto) => tilasto.data[tilastoVuosi])
					.map((tilasto) => (tilasto[cat][yksikko]))
					.reduce((p, c) => p + c, 0)
				)

				var chartDataAll = [['Kategoria', 'Kerrat']]
				chartDataAll = chartDataAll.concat(Object.entries(byCat).map(([key, value]) => ([key, Math.round(value)])))

			}

			if (tilastoDocs.length > 1) {
				const byCat = new Object()
				const kategoriat = ['Jälki', 'Partsa', 'Ilmavainu', 'Tottis', 'Muu reeni', 'Ei kategoriaa', 'Muu y-toiminta']
				kategoriat.forEach((cat) => byCat[cat] = tilastoDocs
					.filter((tilasto) => tilasto.id == this.uid)
					.filter((tilasto) => tilasto.data[tilastoVuosi])
					.map((tilasto) => tilasto.data[tilastoVuosi])
					.map((tilasto) => (tilasto[cat][yksikko]))
					.reduce((p, c) => p + c, 0)
				)

				var chartDataMy = [['Kategoria', 'Kerrat']]
				chartDataMy = chartDataMy.concat(Object.entries(byCat).map(([key, value]) => ([key, value])))

			}
			var reenejaViikossa = 0
			if (kuluvanVuodenTilastot.length > 1) {
				reenejaViikossa = kuluvanVuodenTilastot
					.filter((tilasto) => (tilasto.sumD > 0))
					.map((tilasto) => (tilasto.sumD))
					.reduce((p, c) => p + c, 0) / kuluvanVuodenTilastot.length / (tilastoVuosi == kuluvaVuosi ? (moment().dayOfYear()/7) : 365 / 7)
			}
			const yhdistys = this.tilastoDokumentti.data.yhd || 'PUUTTUU!'

			return (
				<div>
					<div>
						{(isTilastoLoading || false) ? <div ><CircularProgress /></div> : undefined}
					</div>
					<Typography variant="body1" gutterBottom >Oma yhdistys: {yhdistys}
						<IconButton
							onClick={this.openYhdistysEdit} >
							<EditIcon />
						</IconButton>
					</Typography>
					<Dialog onClose={this.closeYhdistysEdit	} open={this.editYhdistys}>
						<Paper sx={{ m: 2, p: 2 }}>
							<Autocomplete
								options={jasenjarjestot.map((option) => option.label)}
								sx={{ width: 400 }}
								id={"edityhdistys"}
								value={this.tilastoDokumentti.data.yhd || ''}
								onChange={(e, value) => {
									if (value !== null) {
										this.tilastoDokumentti.set({ yhd: value }, { merge: true });
										this.closeYhdistysEdit();
									}
								}}
								renderInput={(params) => (
									<TextField {...params} label={"Oma yhdistys"} variant={"filled"} />
								)}
							/>


						</Paper>
					</Dialog>

					<FormControl >
					<InputLabel id="vuosi-select-label">Vuosi</InputLabel>
					<Select
						labelId="vuosi-select-label"
						id="vuosi-select"
						value={tilastoVuosi}
						label="Vuosi"
						onChange={this.vaihdaVuosi}
					>
						{
							vuodet.map((vuosi) =>  <MenuItem value={vuosi} key={vuosi}>{vuosi}</MenuItem>)
						}
					</Select>
					</FormControl>



					<Typography variant="body1" gutterBottom >Yhdistyksen vuosi {tilastoVuosi} yhteensä: {yhdistys_yhteensa} h. Merkintöjä
						keskimäärin {reenejaViikossa.toFixed(2)} päivänä viikossa ({kuluvanVuodenTilastot.length} käyttäjää)</Typography>



					<FormControl>
						<FormLabel id="yksikko-buttons">Kuvaajien yksikkö</FormLabel>
						<RadioGroup
							row
							aria-labelledby="yksikko-buttons"
							name="controlled-radio-buttons-group"
							value={yksikko}
							onChange={this.vaihdaYksikko}
						>
							<FormControlLabel value="X" control={<Radio />} label="Merkintöjä" />
							<FormControlLabel value="H" control={<Radio />} label="Tunteja" />

						</RadioGroup>

					</FormControl>
					<Chart
						chartType="PieChart"
						data={chartDataMy}
						options={{
							title: "Omien merkintöjen " + (yksikko == 'X' ? "" : "tunti") + "jakauma",
							pieSliceText: "value"
						}}
						width={"100%"}
						height={"300px"}
					/>
					<Chart
						chartType="PieChart"
						data={chartDataYhd}
						options={{
							title: "Merkintöjen " + (yksikko == 'X' ? "" : "tunti") + "jakauma yhdistyksessä",
							pieSliceText: "value"
						}}
						width={"100%"}
						height={"300px"}
					/>
					<Chart
						chartType="PieChart"
						data={chartDataAll}
						options={{
							title: "Merkintöjen " + (yksikko == 'X' ? "" : "tunti") + "jakauma, kaikki käyttäjät",
							pieSliceText: "value"
						}}
						width={"100%"}
						height={"300px"}
					/>

					<Typography variant="body1" gutterBottom >Tilastovuoden käyttäjien merkinnät
						yhteensä {tilastovuoden_tunnit_yhteensa} h, 
						hyvinvointia edistävää harrastamista keskimäärin {(tilastovuoden_paivat_yhteensa 
						/ tilastoVuodenKaikkiTilastot.length 
						/ (tilastoVuosi == kuluvaVuosi ? (moment().dayOfYear()) : 365 )
						* 7
						).toFixed(2)} päivänä viikossa 
						({tilastoVuodenKaikkiTilastot.length} käyttäjää, {yhdistykset.size} yhdistystä)</Typography>


				</div>
			)
		}
	}


});

export default Tilasto;
