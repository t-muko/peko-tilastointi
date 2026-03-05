import React, { Component } from 'react';
import { observer } from 'mobx-react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';

import Divider from '@mui/material/Divider';
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
} as const;

interface TodoItemProps {
	todo: any;
}

class TodoItem extends Component<TodoItemProps> {
	_deleting = false;

	render() {
		const { todo } = this.props;
		const { finished, text } = todo.data;

		console.log('TodoItem.render: ', todo.path, ', text: ', text);
		return (
			<Paper>
				<div style={styles.row}>
					<Checkbox
						style={styles.checkbox}
						onChange={this.onPressCheck}
						checked={finished} />
					<TextField
						id={todo.id}
						style={styles.input}
						placeholder={text ? undefined : 'What needs to be done?'}
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
		const { todo } = this.props;
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
		const { todo } = this.props;
		await todo.update({
			finished: !todo.data.finished
		});
	};

	onTextChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const { todo } = this.props;
		await todo.update({
			text: event.target.value
		});
	};
}

export default observer(TodoItem);
