import { makeObservable, observable, action, computed } from 'mobx';
import type { RootStore } from './index';

interface Users {
  [key: string]: Record<string, unknown>;
}

class UserStore {
  users: Users | null = null;
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeObservable(this, {
      users: observable,
      setUsers: action,
      setUser: action,
      userList: computed
    })
    this.rootStore = rootStore;
  }

  setUsers = (users: Users | null) => {
    this.users = users;
  };

  setUser = (user: Record<string, unknown>, uid: string) => {
    if (!this.users) {
      this.users = {};
    }
    this.users[uid] = user;
  };

  get userList() {
    return Object.keys(this.users || {}).map(key => ({
      ...(this.users as Users)[key],
      uid: key,
    }));
  }
}

export default UserStore;