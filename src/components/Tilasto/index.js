import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { makeObservable, observable, action, computed } from 'mobx';
import { FirebaseContext } from '../Firebase';

// import { reenit } from '../../stores/reeniStore';
// import { tilastot } from '../../stores/tilastoFirebase'
import { Collection, Document } from 'firestorter';
import { CircularProgress } from "@mui/material";
import Typography from '@mui/material/Typography';


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

const Tilasto = observer(class Tilasto extends Component {

	yhteensa = null

	static contextType = FirebaseContext

	

	constructor(props) {
		super(props);
		// this.tilastot = tilastot
		/*makeObservable(this, {
			_expand: observable
		})
*/
		this.tilastot = new Collection('tilastot');
	}

	componentDidMount() {
		// console.debug("<Tilasto> mounted")
		const context = this.context;
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
			console.debug("Tilastot render")

			const context = this.context
			this.reenit  = this.context.rootStore.reeniFirestore.reenit
			const reenit = this.reenit

			// this.tilastot = this.context.rootStore.tilastoFirestore.tilastot
			// const tilastot = this.tilastot

			const {docs: tilastoDocs, isLoaded: isTilastoLoading } = this.tilastot;
			// console.debug("Tilastodocs path", this.tilastot.path, tilastoDocs)
			const kaikki_yhteensa = tilastoDocs.map((tilasto) => tilasto.data.totalH || 0).reduce((a, b) => a + b, 0)
			// console.debug("Kaikki yhteensa", kaikki_yhteensa, tilastoDocs.length)

			const { docs, isLoading } = reenit
			// console.debug("reenidocs path", reenit.path)

			const omat_yhteensa = docs.map((reeni) => reeni.data.tunnit || 0).reduce((a, b) => a + b, 0)

			// console.debug("omat yhteensä", omat_yhteensa)
			return (
				<div>
				<div>
					Omat merkinnät yhteensä {omat_yhteensa} h
					{(isLoading || false) ? <div ><CircularProgress /></div> : undefined}
				</div>
				<Typography variant="body1" gutterBottom >Kaikkien merkinnät yhteensä {kaikki_yhteensa} h ({tilastoDocs.length} käyttäjää)</Typography>

				</div>
			)
		}
	}


});

export default Tilasto;
