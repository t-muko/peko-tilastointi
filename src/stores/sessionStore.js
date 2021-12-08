import { makeObservable, observable, action } from 'mobx';

class SessionStore {
  // @observable
  authUser = null;

  constructor(rootStore) {
    makeObservable(this, {
      authUser: observable,
      setAuthUser: action
    })
    this.rootStore = rootStore;
  }

  //@action 
  setAuthUser = authUser => {
    this.authUser = authUser;
  };
  
}

export default SessionStore;