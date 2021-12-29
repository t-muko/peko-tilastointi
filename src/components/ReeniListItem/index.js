import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Paper, Divider } from '@mui/material';

import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';

import ReeniItem from '../ReeniItem';
import { makeObservable, observable, action, computed } from 'mobx';


const styles = {
	container: {
		display: 'flex',
		flexDirection: 'column'
	},
	row: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center'
	},
	checkbox: {
		marginLeft: 16,
		width: 40
	},
	input: {
		flex: 1
	},
	preline: {
		whiteSpace: 'pre-line',
		flex: 1
	},
	icon: {
		marginRight: 6
	}
};

class ReeniListItem extends Component {
	static propTypes = {
		reeni: PropTypes.any
	};

	_editing = false

	constructor(props) {
		super(props)
		makeObservable(this, {
			_editing: observable
		})
	}

	render() {
		const { item, expand } = this.props;
		const { pvm, kategoria, tunnit, alakategoria, kommentti, koira, yhdistys } = item.data;

		// console.log('ReeniItem.render: ', item.path, pvm, kategoria, tunnit);
		return (
			<div>
				{this._editing && <ReeniItem key={item.id + 'edit'} item={item} closeF={this.onClose} />}
				<Paper>
					<div style={styles.row}>
						<div style={styles.input}>
							{pvm || ''}
						</div>
						
						<div style={styles.input}>
							{tunnit ? tunnit + ' h' : ''}
						</div>
						<div style={styles.input}>
							{kategoria || ''}
						</div>
						<IconButton
							style={styles.icon}
							onClick={this.onPressEdit} >
								<EditIcon />
								</IconButton>

					</div>

					{expand && <div style={styles.row}>
						
						<Typography variant="body1" gutterBottom  style={styles.input}>
							{koira || ''}
						</Typography>
					
						<Typography variant="body1" gutterBottom style={styles.preline} >
							{kommentti || ''}
						</Typography>
					
						<Typography variant="body1" gutterBottom  style={styles.input}>
							{yhdistys || ''}
						</Typography>

					</div>}

					<Divider />
				</Paper>
			</div>
		);
	}

	onClose = () => {
		this._editing = false
	}

	onPressEdit = async () => {
		console.debug("Edit mode", this)
		const { item } = this.props;
		if (this._editing) return;
		this._editing = true;
		/*try {
			// await todo.delete();
			this._editing = false;
		}
		catch (err) {
			this._editing = false;
		}*/
	};

}

export default observer(ReeniListItem);
