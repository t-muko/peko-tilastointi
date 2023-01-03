import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { makeObservable, observable, reaction, action } from 'mobx';
import { FirebaseContext } from '../Firebase';

// import { reenit } from '../../stores/reeniStore';
// import { tilastot } from '../../stores/tilastoFirebase'
import { Document } from 'firestorter';


// import FlipMove from 'react-flip-move';
import { CircularProgress, Checkbox } from "@mui/material";
import ReeniListItem from '../ReeniListItem';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';


import * as moment from 'moment';
import 'moment/locale/fi';
import { timelineClasses } from '@mui/lab';
moment.locale('fi')
moment.updateLocale('fi', {
    weekdaysShort : String["su", "ma", "ti", "ke", "to", "pe", "la"]
});


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
		// overflowY: 'scroll'
	}
};

function escapeRegExp(value) {
//	return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
// value.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&').replace(/[\s]/g, '.*');
// ^(?=.*\bSidney\b)(?=.*\bAlice\b)(?=.*\bPeter\b).*$
	var searchRe = value.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&').split(" ")
	searchRe = searchRe.map((wrd) => "(?=.*"+wrd+")" ).join("")
// return "(?=.*vespa)(?=.*lumi)"
return searchRe
}

const Reenit = observer(class Reenit extends Component {

	_expand = false
	yhteensa = null
	suodatetut = 0
	reenit = null
	tilastoRecord = Object()
	searchValue = ""
	// filteredRows = null

	static contextType = FirebaseContext


	constructor(props) {
		super(props);
		makeObservable(this, {
			_expand: observable,
			reenit: observable,
			searchValue: observable,
			tilastoRecord: observable.struct,
			yhteensa: observable,
			setTilastoRecord: action
		})

		/*this.state = {
			disabled: false
		};*/


	}



	componentDidMount() {
		const context = this.context;
		//It will get the data from context, and put it into the state.
		// this.setState({ profile: context.profile });
		this.uid = context.rootStore.sessionStore.authUser.uid
		// console.debug("uid", this.uid)
		// this.filteredRows = this.context.rootStore.reeniFirestore.reenit.docs

		this.tilastoDokumentti = new Document('tilastot/' + this.uid);

		reaction(
			() => this.tilastoRecord,
			() => this.onAddTilasto(),
			{ "delay": 2000 }
		)
	}


	/*
	requestSearch = (searchValue) => {
		console.debug("Searching", searchValue)
		this.searchValue = searchValue;
		const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
		this.filteredRows = this.reenit.docs.filter((row) => {
		  return Object.keys(row.data).some((field) => {
			return searchRegex.test(row.data[field].toString());
		  });
		});
		
	  };

*/

	setTilastoRecord = (tilasto) => {
		this.tilastoRecord = tilasto
	}

	render() {
		// console.debug("Collection path", this.context.rootStore.reeniFirestore.reenit.path)
		// const { disabled } = this.state;
		const context = this.context
		// this.reenit  = context.rootStore.reeniFirestore.reenit
		// this.reenit = context.rootStore.reeniFirestore.reenit

		// this.requestSearch(this.searchValue)
		// console.debug("Regexp", escapeRegExp(this.searchValue))
		const searchRegex = new RegExp(escapeRegExp(this.searchValue), 'i');
		const filteredRows = context.rootStore.reeniFirestore.reenit.docs.filter((row) => {
			// return Object.keys(row.data).some((field) => {
			//	console.debug("rowdata", field)
			//	return searchRegex.test(field == "pvm" ? moment(row.data[field]).format("D.M.YYYY dddd").toString() || '' : row.data[field].toString());
			// });

			// Haku toimii niin, että regexp etsii hakusanoja missä tahansa järjestyksessä stringistä. Luodaan string, jossa on kaikki halutut kentät formatoituna
			// console.debug("rowdata", row.data)
			const concatenoituString = (moment(row.data['pvm']).format("D.M.YYYY dddd MMMM").toString() || '') 
			+ ' ' + row.data['koira'].toString()
			+ ' ' + row.data['kategoria'].toString()
			+ ' ' + row.data['kommentti'].toString()
			// console.debug("concatenoituString", concatenoituString)
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
			// const children = docs.map((reeni) => <ReeniListItem key={reeni.id} item={reeni} expand={this._expand} />);
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
			const vuodet = range(2021, kuluvaVuosi+1, 1)

			// console.log("Vuodet", vuodet)
			// const foo = [2021, 2022].map((vuosi) => {
			vuodet.map((vuosi) => {
				const vuodenReenit = docs.filter((rivi) => rivi.data.pvm.includes(vuosi))
				const reenipaivat = new Set()
				vuodenReenit.map((reeni) => reenipaivat.add(reeni.data.pvm))
				vt[vuosi] = {
					sumH: vuodenReenit.map((reeni) => reeni.data.tunnit || 0).reduce((a, b) => a + b, 0),
					sumX: vuodenReenit.length,
					sumD: reenipaivat.size
				}
				// console.debug("set", reenipaivat)
				
				const cat = ['Jälki', 'Partsa', 'Ilmavainu', 'Tottis', 'Muu reeni', 'Ei kategoriaa', 'Muu y-toiminta']
				cat.map((kategoria) =>{
					const kategorianReenit = vuodenReenit.filter((rivi) => rivi.data.kategoria.includes(kategoria))
					vt[vuosi][kategoria] = {
						H: kategorianReenit.map((reeni) => reeni.data.tunnit || 0).reduce((a, b) => a + b, 0),
						X: kategorianReenit.length
					}
				})
			}
			)
			console.debug("vuositilasto", vt)
			// this.tilastoRecord = vt
			this.setTilastoRecord(vt)
}
			// this.onAddTilasto()
			// console.debug("Docs: ", children)
			// console.debug("Yhteensä", this.yhteensa)

			// const { isLoading } = this.reenit;
			// console.log('Reenit.render, isLoading: ', isLoading);
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
						flexWrap: 'wrap', backgroundColor: '#f0f0f0'
					}}>
						<FormGroup>
							<FormControlLabel sx={{ color: 'black' }} control={<Checkbox
								checked={this._expand}
								onChange={this.onCheckExpand} />}
								label='Näytä muistiinpanot' />
						</FormGroup>

							<Typography sx={{ color: 'black', verticalAlign: 'middle', p: 1 }}>
								{filteredRows.length}x, yht.{this.suodatetut} h
							</Typography>
							

						<TextField
							variant="standard"
							value={this.searchValue}
							// onChange={(e) => this.requestSearch(e.target.value)}
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
										// onClick={(e) => this.requestSearch('')}
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

	onCheckShowOnlyUnfinished = () => {
		if (this.reenit.query) {
			this.reenit.query = undefined;
		}
		else {
			this.reenit.query = this.reenit.ref.where('finished', '==', false).limit(10);
		}
	};

	/*onCheckDisable = () => {
		this.setState({
			disabled: !this.state.disabled
		});
	}*/

	onCheckExpand = () => {
		this._expand = !this._expand
	}

	onAddTilasto = async () => {
		console.debug("Päivitetään tilasto")
		if (this.uid && (this.tilastoRecord['totalD'] || 0) >0 ) {
			try {
				//const tilastoDokumentti = new Document('tilastot/' + this.uid);
				// console.debug("doc with customid tilasto", docWithCustomId)
				this.tilastoDokumentti.set(
					this.tilastoRecord
					/*{
					totalH: this.yhteensa,
					yhd: 'PPK',
					2021: { totalH: 123, partsaH: 12, jälkiH: 13, partsaX: 2 },
				}*/
				,
				{merge: true});
			}
			catch (err) {
	console.error("Virhe", err)
	// TODO
}
		} else {
	console.error("Ei ole uid:ta, tai tilastopäiviä on nolla")
}
	};

});

export default Reenit;
