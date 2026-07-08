import { makeObservable, observable, action } from 'mobx';
import type { User } from 'firebase/auth';
import type { RootStore } from './index';

class SessionStore {
  authUser: User | null = null;
  // True once the ID token has propagated to the Firestore client for the current
  // authUser (or the getIdToken attempt has settled) — see Firebase.ts. Firestore
  // reads gated by `request.auth != null` should wait for this before subscribing,
  // since a listener that opens too early gets permission-denied and never retries.
  authTokenReady = false;
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeObservable(this, {
      authUser: observable,
      authTokenReady: observable,
      setAuthUser: action,
      setAuthTokenReady: action
    })
    this.rootStore = rootStore;
  }

  setAuthUser = (authUser: User | null) => {
    this.authUser = authUser;
  };

  setAuthTokenReady = (ready: boolean) => {
    this.authTokenReady = ready;
  };

  get userOk(): boolean {
    return !!(this.authUser && this.authUser.uid);
  }
}

export default SessionStore;