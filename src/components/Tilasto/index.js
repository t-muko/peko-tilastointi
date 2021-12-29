import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { makeObservable, observable, action, computed } from 'mobx';
import { FirebaseContext } from '../Firebase';

// import { reenit } from '../../stores/reeniStore';
import { tilastot } from '../../stores/tilastoFirebase'
import { Collection, Document } from 'firestorter';

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
		/*makeObservable(this, {
			_expand: observable
		})
*/
	}

	componentDidMount() {
		console.debug("<Tilasto> mounted")
		const context = this.context;
	}

	render() {
		console.debug("Tilastot render")
	
		const tilastoDocs = tilastot.docs;
		console.debug("Tilastodocs", tilastoDocs)
		// const kaikki_yhteensa = tilastoDocs.map((tilasto) => {console.debug("data", tilasto.data); tilasto.data.totalH || 0}).reduce((a, b) => a + b, 0)
		
		const { docs } = this.context.rootStore.reeniFirestore.reenit;
		console.debug("reenidocs", docs)
		
		const omat_yhteensa = docs.map((reeni) => reeni.data.tunnit || 0).reduce((a, b) => a + b, 0)
		
		return (
			<div>
				Reenit yhteensä {omat_yhteensa} h
			</div>	
		);
	}


});

export default Tilasto;
