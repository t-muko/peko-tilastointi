import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { makeObservable, observable, reaction, action } from 'mobx';
import { FirebaseContext } from '@components/Firebase/Firebase';

import { Document } from 'firestorter';
import { CircularProgress, Checkbox } from "@mui/material";
import ReeniListItem from '@components/ReeniListItem';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';
import { REENI_CATEGORIES } from '../constants/reeniCategories';


import moment from 'moment';
import 'moment/locale/fi';
moment.locale('fi')


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
	}
} as const;

// Builds a regex that matches all search words in any order (AND logic).
// Each word becomes a lookahead, e.g. "vespa lumi" → "(?=.*vespa)(?=.*lumi)"
function escapeRegExp(value) {
	const searchRe = value.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&').split(" ")
	return searchRe.map((wrd) => "(?=.*" + wrd + ")").join("")
}

const Reenit = observer(class Reenit extends Component {

	_expand = false;
	yhteensa: number | null = null;
	suodatetut = 0;
	reenit: any = null;
	tilastoRecord: Record<string, any> = {};
	searchValue = "";
	uid!: string;
	tilastoDokumentti: any;

	static contextType = FirebaseContext;
	declare context: any;


	constructor(props: any) {
		super(props);
		makeObservable(this, {
			_expand: observable,
			reenit: observable,
			searchValue: observable,
			tilastoRecord: observable.struct,
			yhteensa: observable,
			setTilastoRecord: action
		})
	}


	componentDidMount() {
		const context = this.context;
		this.uid = context.rootStore.sessionStore.authUser.uid
		this.tilastoDokumentti = new Document('tilastot/' + this.uid);

		// Update tilasto document whenever the computed tilastoRecord changes (debounced)
		reaction(
			() => this.tilastoRecord,
			() => this.onAddTilasto(),
			{ "delay": 2000 }
		)

		reaction(
			() => context.rootStore.sessionStore.authUser,
			() => {
				if (context.rootStore.sessionStore.authUser != null) {
					console.debug("User changed, change tilastoDokumentti")
					this.uid = context.rootStore.sessionStore.authUser.uid
					this.tilastoDokumentti = new Document('tilastot/' + this.uid);
				}
				else {
					console.debug("User nulled, null tilastoDokumentti")
					this.tilastoDokumentti = null;
				}
			}
		)
	}


	setTilastoRecord = (tilasto) => {
		this.tilastoRecord = tilasto
	}

	render() {
		const context = this.context
		const searchRegex = new RegExp(escapeRegExp(this.searchValue), 'i');

		// Search concatenates date (Finnish locale), koira, kategoria and kommentti
		// so all words match in any order across those fields
		const filteredRows = context.rootStore.reeniFirestore.reenit.docs.filter((row) => {
			const concatenoituString = (moment(row.data['pvm']).format("D.M.YYYY dddd MMMM").toString() || '')
				+ ' ' + row.data['koira'].toString()
				+ ' ' + row.data['kategoria'].toString()
				+ ' ' + row.data['kommentti'].toString().replace(/(\r\n|\n|\r)/gm, "")
			return searchRegex.test(concatenoituString);
		});

		if (!context.rootStore.sessionStore.userOk) {
			console.log('Reenit.render, disabled. Bad path/user');
			return (
				<div>
					<div style={styles.header}>
						<div />

					</div>
				</div>
			);
		} else {
			const { docs, isLoading } = context.rootStore.reeniFirestore.reenit;
			const children = filteredRows.map((reeni) => <ReeniListItem key={reeni.id} item={reeni} expand={this._expand} />);
			this.yhteensa = docs.map((reeni) => reeni.data.tunnit || 0).reduce((a, b) => a + b, 0)
			this.suodatetut = filteredRows.map((reeni) => reeni.data.tunnit || 0).reduce((a, b) => a + b, 0)

			if (!isLoading) {
				const vt = new Object()
				const reenipaivat = new Set()
				docs.map((reeni) => reenipaivat.add(reeni.data.pvm))

				// vt['yhd'] = 'PPK'
				vt['totalH'] = docs.map((reeni) => reeni.data.tunnit || 0).reduce((a, b) => a + b, 0)
				vt['totalD'] = reenipaivat.size

				const kuluvaVuosi = (new Date()).getFullYear()

				const range = (start, stop, step = 1) =>
					Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)
				const vuodet = range(2021, kuluvaVuosi + 1, 1)

				// console.log("Vuodet", vuodet)
				vuodet.map((vuosi) => {
					const vuodenReenit = docs.filter((rivi) => rivi.data.pvm.includes(vuosi))
					const reenipaivat = new Set()
					vuodenReenit.map((reeni) => reenipaivat.add(reeni.data.pvm))
					vt[vuosi] = {
						sumH: vuodenReenit.map((reeni) => reeni.data.tunnit || 0).reduce((a, b) => a + b, 0),
						sumX: vuodenReenit.length,
						sumD: reenipaivat.size
					}

					REENI_CATEGORIES.map((kategoria) => {
						const kategorianReenit = vuodenReenit.filter((rivi) => rivi.data.kategoria.includes(kategoria))
						vt[vuosi][kategoria] = {
							H: kategorianReenit.map((reeni) => reeni.data.tunnit || 0).reduce((a, b) => a + b, 0),
							X: kategorianReenit.length
						}
					})
				}
				)
				this.setTilastoRecord(vt)
			}
			return (
				<div style={styles.container}>
					<Box sx={{
						p: 0.5,
						pb: 0,
						pl: 2,
						pr: 2,

						justifyContent: 'space-between',
						display: 'flex',
						alignItems: 'flex-start',
						flexWrap: 'wrap',
						backgroundColor: 'action.hover',
						borderBottom: 1,
						borderColor: 'divider'
					}}>
						<FormGroup>
							<FormControlLabel control={<Checkbox
								checked={this._expand}
								onChange={this.onCheckExpand} />}
								label='Näytä muistiinpanot' />
						</FormGroup>

						<Typography sx={{ verticalAlign: 'middle', p: 1 }}>
							{filteredRows.length}x, yht.{this.suodatetut} h
						</Typography>


						<TextField
							variant="standard"
							value={this.searchValue}

							onChange={(e) => this.searchValue = e.target.value}
							placeholder="Hae esim. '2022 ilmaisu'..."
							InputProps={{
								startAdornment: <SearchIcon fontSize="small" />,
								endAdornment: (
									<IconButton
										title="Clear"
										aria-label="Clear"
										size="small"
										style={{ visibility: this.searchValue ? 'visible' : 'hidden' }}

										onClick={(e) => this.searchValue = ''}
									>
										<ClearIcon fontSize="small" />
									</IconButton>
								),
							}}
							sx={{
								width: {
									xs: 1,
									sm: 'auto',
								},
								m: (theme) => theme.spacing(1, 0.5, 1.5),
								'& .MuiSvgIcon-root': {
									mr: 0.5,
								},
								'& .MuiInput-underline:before': {
									borderBottom: 1,
									borderColor: 'divider',
								},
							}}
						/>
					</Box>
					<div style={styles.content} className='mobile-margins'>

						{children}

					</div>
					{isLoading ? <div style={styles.loader}><CircularProgress /></div> : undefined}
				</div>
			);
		}
	}

	onCheckExpand = () => {
		this._expand = !this._expand
	}

	onAddTilasto = async () => {
		if (this.uid && (this.tilastoRecord['totalD'] || 0) > 0) {
			try {
				this.tilastoDokumentti.set(this.tilastoRecord, { merge: true });
			}
			catch (err) {
				console.error("Virhe tilastoa päivitettäessä", err)
			}
		} else {
			console.error("Ei ole uid:ta, tai tilastopaiviä on nolla")
		}
	};

});

export default Reenit;
