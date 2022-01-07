import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Paper, Divider } from '@mui/material';

import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';

import ReeniItem from '../ReeniItem';
import { makeObservable, observable, action, computed } from 'mobx';

import * as moment from 'moment';
import 'moment/locale/fi';
import { timelineClasses } from '@mui/lab';
moment.locale('fi')
moment.updateLocale('fi', {
    weekdaysShort : String["su", "ma", "ti", "ke", "to", "pe", "la"]
});

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
			_editing: observable,
			onClose: action,
			openEdit: action
		})


	}

	render() {
		const { item, expand } = this.props;
		const { pvm, kategoria, tunnit, alakategoria, kommentti, koira, yhdistys } = item.data;
		if (kategoria == '' && tunnit == 0) {
			this.openEdit()
		}

		// console.log('ReeniItem.render: ', item.path, pvm, kategoria, tunnit);
		return (
			<div>
				{this._editing && <ReeniItem key={item.id + 'edit'} item={item} closeF={this.onClose} />}
				<Paper>
					<div style={styles.row}>
						<div style={styles.input}>
							{moment(pvm).format("D.M.YYYY dd") || ''}
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
						
						<Typography  gutterBottom  style={styles.input}>
							{koira || ''}
						</Typography>
					
						<Typography align="left"  gutterBottom style={styles.preline} >
							{kommentti || ''}
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

	openEdit = () => {
		this._editing = true
	} 

	onPressEdit = async () => {
		console.debug("Edit mode", this)
		const { item } = this.props;
		if (this._editing) return;
		//this._editing = true;
		this.openEdit()
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
