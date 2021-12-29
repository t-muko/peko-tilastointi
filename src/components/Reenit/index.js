import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { makeObservable, observable, action, computed } from 'mobx';
import { FirebaseContext } from '../Firebase';

// import { reenit } from '../../stores/reeniStore';
import { tilastot } from '../../stores/tilastoFirebase'
import { Collection, Document } from 'firestorter';


// import FlipMove from 'react-flip-move';
import { CircularProgress, Checkbox } from "@mui/material";
import ReeniListItem from '../ReeniListItem';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

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

const Reenit = observer(class Reenit extends Component {

	_expand = false
	yhteensa = null
	reenit = null

	static contextType = FirebaseContext


	constructor(props) {
		super(props);
		makeObservable(this, {
			_expand: observable,
			reenit: observable
		})

		this.state = {
			disabled: false
		};


		//this.onAddTilasto()
	}

	componentDidMount() {
		const context = this.context;
		//It will get the data from context, and put it into the state.
		// this.setState({ profile: context.profile });
		this.uid = context.rootStore.sessionStore.authUser.uid
		console.debug("uid", this.uid)
		 
	}

	render() {
		console.debug("Collection path", this.context.rootStore.reeniFirestore.reenit.path)
		const { disabled } = this.state;
		const context = this.context
		this.reenit  = this.context.rootStore.reeniFirestore.reenit
		const reenit = this.reenit
		if (!context.rootStore.sessionStore.userOk ) {
			console.log('Reenit.render, disabled. Bad path/user');
			return (
				<div>
					<div style={styles.header}>
						<div />
						
					</div>
				</div>
			);
		} else {
			console.log("Reenit render enabled", reenit.path, reenit)
		const { docs, query, isLoading } = reenit;
		const children = docs.map((reeni) => <ReeniListItem key={reeni.id} item={reeni} expand={this._expand} />);
		this.yhteensa = docs.map((reeni) => reeni.data.tunnit || 0).reduce((a, b) => a + b, 0)
		this.onAddTilasto()
		// console.debug("Docs: ", children)
		console.debug("Yhteensä", this.yhteensa)

		// const { isLoading } = this.reenit;
		console.log('Reenit.render, isLoading: ', isLoading);
		return (
			<div style={styles.container}>
				<FormGroup>
					<FormControlLabel control={<Checkbox
						checked={this._expand}
						onChange={this.onCheckExpand} />}
						label='Näytä muistiinpanot' />
				</FormGroup>

				<div style={styles.content} className='mobile-margins'>

					{children}

				</div>
				{isLoading ? <div style={styles.loader}><CircularProgress /></div> : undefined}
			</div>
		);}
	}

	onCheckShowOnlyUnfinished = () => {
		if (this.reenit.query) {
			this.reenit.query = undefined;
		}
		else {
			this.reenit.query = this.reenit.ref.where('finished', '==', false).limit(10);
		}
	};

	onCheckDisable = () => {
		this.setState({
			disabled: !this.state.disabled
		});
	}

	onCheckExpand = () => {
		this._expand = !this._expand
	}

	onAddTilasto = async () => {
		if (this.uid) {
			try {
				const docWithCustomId = new Document('tilastot/' + this.uid);
				console.debug(docWithCustomId)
				docWithCustomId.set({
					totalH: this.yhteensa,
					uid: this.uid
				});
			}
			catch (err) {
				console.error("Virhe", err)
				// TODO
			}
		} else {
			console.error("Ei ole uid:ta")
		}
	};

});

export default Reenit;
