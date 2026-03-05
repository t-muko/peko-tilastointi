import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './App.css';
// import { Provider } from 'mobx-react';

import rootStore from './stores';

import App from './components/App';
// import Firebase, { FirebaseContext } from './components/Firebase';
import { FirebaseContext } from './components/Firebase';

// if (!new class { x }().hasOwnProperty('x')) throw new Error('Transpiler is not configured correctly');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FirebaseContext.Provider value={{ rootStore: rootStore }}>
      <App />
    </FirebaseContext.Provider>
  </React.StrictMode>
);
