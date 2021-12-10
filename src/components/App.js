import logo from '../logo.svg';

// Material-ui
import * as React from 'react';
// import ReactDOM from 'react-dom';
import Button from '@mui/material/Button';
import  { FirebaseContext } from './Firebase';

function App() {
  return (
    <FirebaseContext.Consumer>
        {firebase => {
      return <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <Button variant="contained" onClick={() => {
          firebase.autentikoi();
        }}
        >Hello World</Button>

        <Button variant="contained" onClick={() => {
          firebase.haeYhdistykset();
        }}
        >Hae</Button>

      </header>
    </div>}}
    </FirebaseContext.Consumer>
  );
}

export default App;
