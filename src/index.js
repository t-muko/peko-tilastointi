import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './App.css';
// import { Provider } from 'mobx-react';

import rootStore from './stores';

import App from './components/App';
import reportWebVitals from './reportWebVitals';
// import Firebase, { FirebaseContext } from './components/Firebase';
import { FirebaseContext } from './components/Firebase';

// if (!new class { x }().hasOwnProperty('x')) throw new Error('Transpiler is not configured correctly');

ReactDOM.render(
  
  <React.StrictMode>

    <FirebaseContext.Provider value={{ rootStore: rootStore}}>
    <App />
    </FirebaseContext.Provider>

  </React.StrictMode>
  ,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
