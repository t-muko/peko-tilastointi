import { makeObservable, observable, action, computed } from 'mobx';
import type { RootStore } from './index';

interface Messages {
  [key: string]: Record<string, unknown>;
}

class MessageStore {
  messages: Messages | null = null;
  limit = 5;
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeObservable(this, {
      messages: observable,
      limit: observable,
      setMessages: action,
      setLimit: action,
      messageList: computed
    })
    this.rootStore = rootStore;
  }

  setMessages = (messages: Messages | null) => {
    this.messages = messages;
  };

  setLimit = (limit: number) => {
    this.limit = limit;
  };

  get messageList() {
    return Object.keys(this.messages || {}).map(key => ({
      ...(this.messages as Messages)[key],
      uid: key,
    }));
  }
}

export default MessageStore;