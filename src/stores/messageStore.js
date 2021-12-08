import { makeObservable, observable, action, computed } from 'mobx';

class MessageStore {
  messages = null;
  limit = 5;

  constructor(rootStore) {
    makeObservable(this, {
      messages: observable,
      limit: observable,
      setMessages: action,
      setLimit: action,
      messageList: computed
    })
    this.rootStore = rootStore;
  }

  //@action 
  setMessages = messages => {
    this.messages = messages;
  };

  //@action 
  setLimit = limit => {
    this.limit = limit;
  };

  // @computed 
  get messageList() {
    return Object.keys(this.messages || {}).map(key => ({
      ...this.messages[key],
      uid: key,
    }));
  }
}

export default MessageStore;