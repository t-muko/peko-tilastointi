import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
// import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';

// KESKEN!
import Divider from 'material-ui/Divider';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Paper from '@mui/material/Paper';

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
	icon: {
		marginRight: 6
	}
};

class TodoItem extends Component {
	static propTypes = {
		todo: PropTypes.any
	};

	render() {
		const {todo} = this.props;
		const {finished, text} = todo.data;

		console.log('TodoItem.render: ', todo.path, ', text: ', text);
		return (
			<Paper>
				<div style={styles.row}>
					<Checkbox
						style={styles.checkbox}
						onCheck={this.onPressCheck}
						checked={finished} />
					<TextField
						id={todo.id}
						style={styles.input}
						underlineShow={false}
						hintText={text ? undefined : 'What needs to be done?'}
						onChange={this.onTextChange}
						value={text || ''} />
					<IconButton
						style={styles.icon}
						onClick={this.onPressDelete} >
						<DeleteIcon />
						</IconButton>
				</div>
				<Divider />
			</Paper>
		);
	}

	onPressDelete = async () => {
		const {todo} = this.props;
		if (this._deleting) return;
		this._deleting = true;
		try {
			await todo.delete();
			this._deleting = false;
		}
		catch (err) {
			this._deleting = false;
		}
	};

	onPressCheck = async () => {
		const {todo} = this.props;
		await todo.update({
			finished: !todo.data.finished
		});
	};

	onTextChange = async (event, newValue) => {
		const {todo} = this.props;
		await todo.update({
			text: newValue
		});
	};
}

export default observer(TodoItem);
