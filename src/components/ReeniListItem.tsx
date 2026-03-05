import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Paper, Divider } from '@mui/material';

import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';

import ReeniItem from '@components/ReeniItem';
import { makeObservable, observable, action } from 'mobx';

import moment from 'moment';

const fiFiWeekdays = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
const formatPvm = (pvm: string): string => {
	const m = moment(pvm);
	return m.isValid() ? `${m.format('D.M.YYYY')} ${fiFiWeekdays[m.day()]}` : '';
}

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
} as const;

interface ReeniListItemProps {
	item: any;
	expand?: boolean;
}

class ReeniListItem extends Component<ReeniListItemProps> {
	_editing = false;

	constructor(props: ReeniListItemProps) {
		super(props)
		makeObservable(this, {
			_editing: observable,
			onClose: action,
			openEdit: action
		})


	}

	render() {
		const { item, expand } = this.props;
		const { pvm, kategoria, tunnit, kommentti, koira } = item.data;
		if (kategoria === '' && tunnit === 0) {
			this.openEdit()
		}

		return (
			<div>
				{this._editing && <ReeniItem key={item.id + 'edit'} item={item} closeF={this.onClose} />}
				<Paper>
					<div style={styles.row}>
						<div style={styles.input}>
							{formatPvm(pvm)}
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

						<Typography gutterBottom style={styles.input}>
							{koira || ''}
						</Typography>

						<Typography align="left" gutterBottom style={styles.preline} >
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

	onPressEdit = () => {
		if (this._editing) return;
		this.openEdit()
	};

}

export default observer(ReeniListItem);
