import SessionStore from './sessionStore';
import UserStore from './userStore';
import MessageStore from './messageStore';
import React from 'react'
import Firebase from '@components/Firebase/Firebase';
import ReeniFireStorter from './reeniStore';
import TilastoFireStorter from './tilastoFirebase';

class RootStore {
  sessionStore: SessionStore;
  messageStore: MessageStore;
  firebase: Firebase;
  reeniFirestore: ReeniFireStorter;

  constructor() {
    this.sessionStore = new SessionStore(this);
    // this.userStore = new UserStore(this);
    this.messageStore = new MessageStore(this);
    this.reeniFirestore = new ReeniFireStorter(this);
    this.firebase = new Firebase(this);
    // this.tilastoFirestore = new TilastoFireStorter(this);
  }
}

const rootStore = new RootStore();

export default rootStore;
export type { RootStore };
