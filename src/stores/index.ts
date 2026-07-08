import SessionStore from './sessionStore';
import UserStore from './userStore';
import MessageStore from './messageStore';
import React from 'react'
import Firebase from '@components/Firebase/Firebase';
import ReeniFireStorter from './reeniStore';

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
  }
}

const rootStore = new RootStore();

export default rootStore;
export type { RootStore };
