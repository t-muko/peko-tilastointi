import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './App.css';

import rootStore from '@stores';

import App from '@components/App';
import { FirebaseContext } from '@components/Firebase/Firebase';

if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  (window as any).__rootStore = rootStore;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FirebaseContext.Provider value={{ rootStore: rootStore }}>
      <App />
    </FirebaseContext.Provider>
  </React.StrictMode>
);
