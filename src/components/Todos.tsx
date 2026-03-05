import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { todos } from '@stores/todoStore';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TodoItem from '@components/TodoItem';

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
} as const;

interface TodosState {
	disabled: boolean;
}

const Todos = observer(class Todos extends Component<{}, TodosState> {
	constructor(props: {}) {
		super(props);
		this.state = {
			disabled: false
		};
	}

	render() {
		const { disabled } = this.state;
		if (disabled) {
			console.log('Todos.render, disabled');
			return (
				<div>
					<div style={styles.header}>
						<div />
						<FormControlLabel
							control={<Checkbox checked={disabled} onChange={this.onCheckDisable} />}
							label='Disable observe' />
					</div>
				</div>
			);
		}
		const { docs, query } = todos;
		const children = docs.map((todo) => <TodoItem key={todo.id} todo={todo} />);
		// console.debug("Docs: ", children)
		const { isLoading } = todos;
		console.log('Todos.render, isLoading: ', isLoading);
		return (
			<div style={styles.container}>
				<div style={styles.header}>
					<FormControlLabel
						control={<Checkbox checked={query ? true : false} onChange={this.onCheckShowOnlyUnfinished} />}
						label='Hide finished' />
					{/* <FormControlLabel
						control={<Checkbox checked={disabled} onChange={this.onCheckDisable} />}
						label='Disable observe' />*/}
				</div>
				<div style={styles.content} className='mobile-margins'>

					{children}

				</div>
				{isLoading ? <div style={styles.loader}><CircularProgress /></div> : undefined}
			</div>
		);
	}

	onCheckShowOnlyUnfinished = () => {
		if (todos.query) {
			todos.query = undefined;
		}
		else {
			todos.query = todos.ref.where('finished', '==', false).limit(10);
		}
	};

	onCheckDisable = () => {
		this.setState({
			disabled: !this.state.disabled
		});
	}
});

export default Todos;
