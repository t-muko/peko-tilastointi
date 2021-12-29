import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { makeObservable, observable, action, computed } from 'mobx';

import { reenit } from '../../stores/reeniStore';
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

	constructor(props) {
		super(props);
		makeObservable(this, {
			_expand: observable
		})

		this.state = {
			disabled: false
		};
	}

	render() {
		const { disabled } = this.state;
		if (disabled) {
			console.log('Reenit.render, disabled');
			return (
				<div>
					<div style={styles.header}>
						<div />
						<Checkbox
							label='Disable observe'
							checked={disabled}
							onCheck={this.onCheckDisable} />
					</div>
				</div>
			);
		}
		const { docs, query } = reenit;
		const children = docs.map((reeni) => <ReeniListItem key={reeni.id} item={reeni} expand={this._expand} />);
		const yhteensa = docs.map((reeni) => reeni.data.tunnit || 0).reduce((a, b) => a + b, 0)
		// console.debug("Docs: ", children)
		console.debug("Yhteensä", yhteensa)

		const { isLoading } = reenit;
		console.log('Reenit.render, isLoading: ', isLoading);
		return (
			<div style={styles.container}>
				<FormGroup>
					<FormControlLabel control={<Checkbox
						checked={this._expand}
						onChange={this.onCheckExpand} />}
						label='Näytä kaikki' />
				</FormGroup>

				<div style={styles.content} className='mobile-margins'>

					{children}

				</div>
				{isLoading ? <div style={styles.loader}><CircularProgress /></div> : undefined}
			</div>
		);
	}

	onCheckShowOnlyUnfinished = () => {
		if (reenit.query) {
			reenit.query = undefined;
		}
		else {
			reenit.query = reenit.ref.where('finished', '==', false).limit(10);
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
});

export default Reenit;
