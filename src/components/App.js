import logo from '../logo.svg';

// Material-ui
// import * as React from 'react';
import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
import Button from '@mui/material/Button';
import { FirebaseContext } from './Firebase';
import Todos from './Todos'
import { todos } from '../stores/todoStore';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ContentAddIcon from 'material-ui/svg-icons/content/add';
import FloatingActionButton from 'material-ui/FloatingActionButton';


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
		position: 'absolute',
		bottom: 20,
		right: 20
	}
};

const muiTheme = getMuiTheme();

// function App() {
class App extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>

        <FirebaseContext.Consumer>
          {firebase2 => {
            return <div className="App">
              <header className="App-header">
                
                <Button variant="contained" onClick={() => {
                  firebase2.autentikoi();
                }}
                >Hello World</Button>

                <Button variant="contained" onClick={() => {
                  firebase2.haeYhdistykset();
                }}
                >Hae</Button>
                <div style={styles.container}>
					<div style={styles.header}>
						<div style={styles.headerRow}>
							<img src={logo} alt='logo' style={styles.logo} />
							<h1 style={styles.h1}>Firestorter Todo</h1>
						</div>
						<h3 style={styles.h3}>Firestore & React, using MobX</h3>
					</div>
					<Todos />
					<FloatingActionButton style={styles.add} onClick={this.onPressAdd}>
						<ContentAddIcon />
					</FloatingActionButton>
				</div>

              </header>
            </div>
          }}
        </FirebaseContext.Consumer>
      </MuiThemeProvider>

    );
  }

  onPressAdd = async () => {
    try {
      await todos.add({
        finished: false,
        text: ''
      });
    }
    catch (err) {
      // TODO
    }
  };
}



export default App;
