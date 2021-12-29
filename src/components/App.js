import logo from '../logo.svg';

import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
import Button from '@mui/material/Button';
import { FirebaseContext } from './Firebase';
// import Todos from './Todos'
// import { todos } from '../stores/todoStore';
import { reenit } from '../stores/reeniStore';

import {observer} from "mobx-react";

import { ThemeProvider, createTheme } from '@mui/material/styles'; // v1.x

import FloatingActionButton from '@mui/material/Fab';
import ContentAddIcon from '@mui/icons-material/Add';


import Reenit from './Reenit';



// import { useStores } from '../hooks/use-stores'



const styles = {
	container: {
		position: 'absolute',
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		display: 'flex',
		flexDirection: 'column'
	},
	header: {
		padding: 20,
		paddingBottom: 0,
		paddingRight: 10
	},
	headerRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center'
	},
	h1: {
		margin: 0,
		padding: 0
	},
	h3: {
		marginBottom: 0
	},
	logo: {
		height: 50,
		marginRight: 10
	},
	add: {
		position: 'fixed',
		bottom: 20,
		right: 20
	},
	login: {
		position: 'fixed',
		bottom: 20,
		left: 30
	}
};

// const muiTheme = getMuiTheme(lightBaseTheme);
const muiTheme = createTheme()

// function App() {
class App extends Component {
	static contextType = FirebaseContext

	constructor(props) {
		super(props)
        // this.rootStore = props.rootStore
		// const { rootStore } = useStores()
    }
	render() {
		console.debug("App render user", this.context.rootStore.sessionStore.authUser)
		return (
				<FirebaseContext.Consumer>
					{context => {
						return <div className="App">
							<header className="App-header">
								<div style={styles.container}>
									<div style={styles.header}>
										<div style={styles.headerRow}>
											<img src='https://pirkanmaanpelastuskoirat.fi/images/ppk-logo3.png' alt='logo' style={styles.logo} />
											<h1 style={styles.h1}>Reenipäiväkirja</h1>
										</div>
									</div>
									{context.rootStore.sessionStore.authUser && <div>
										<h3>{context.rootStore.sessionStore.authUser.displayName}</h3>
										<Reenit />
										<FloatingActionButton style={styles.add} onClick={this.onPressAdd}>
											<ContentAddIcon />
										</FloatingActionButton>
									</div>}
									
								</div>
								{!context.rootStore.sessionStore.authUser && <Button  style={styles.login} variant="contained" onClick={() => {
										context.rootStore.firebase.autentikoi();
									}}
									>Login</Button>}
								
								{context.rootStore.sessionStore.authUser &&	<Button style={styles.login} variant="contained" onClick={() => {
										context.rootStore.firebase.logout();
									}}
									>Logout</Button>}

							</header>
							

						</div>
					}}
				</FirebaseContext.Consumer>

		);
	}

	onPressAdd = async () => {
		try {
			await reenit.add({
				pvm: (new Date()).getFullYear() + '-' + ((new Date()).getMonth() + 1) + '-' + (new Date()).getDate(),
				tunnit: 0,
				kommentti: '',
				kategoria: ''
			});
		}
		catch (err) {
			// TODO
		}
	};
}



export default (observer(App));
