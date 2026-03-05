import SessionStore from './sessionStore';
import UserStore from './userStore';
import MessageStore from './messageStore';
import React from 'react'
import Firebase from '@components/Firebase/Firebase';
import ReeniFireStorter from './reeniStore';
import TilastoFireStorter from './tilastoFirebase';

class RootStore {
  constructor() {
    this.sessionStore = new SessionStore(this);
    // this.userStore = new UserStore(this);
    this.messageStore = new MessageStore(this);
    this.firebase = new Firebase(this);
    this.reeniFirestore = new ReeniFireStorter(this);
    // this.tilastoFirestore = new TilastoFireStorter(this);
  }
}

const rootStore = new RootStore();

export default rootStore;

// https://dev.to/evangunawan/react-context-the-easy-way-stateful-component-bh0

/*
export const storesContext = React.createContext({
  sessionStore: new SessionStore(),
  // themeStore: new ThemeStore(),
})
*/
/*
const storesContext = React.createContext({
  rootStore: new RootStore()
})

export default storesContext;
*/