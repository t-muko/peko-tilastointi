import { makeObservable, observable, action } from 'mobx';
import type { User } from 'firebase/auth';
import type { RootStore } from './index';

class SessionStore {
  authUser: User | null = null;
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeObservable(this, {
      authUser: observable,
      setAuthUser: action
    })
    this.rootStore = rootStore;
  }

  setAuthUser = (authUser: User | null) => {
    this.authUser = authUser;
  };

  get userOk(): boolean {
    return !!(this.authUser && this.authUser.uid);
  }
}

export default SessionStore;