import { describe, expect, it } from 'vitest';
import SessionStore from '@stores/sessionStore';

describe('SessionStore userOk', () => {
  it('returns true when authUser has uid', () => {
    const rootStore = {} as never;
    const store = new SessionStore(rootStore);

    store.setAuthUser({ uid: 'u1' } as never);

    expect(store.userOk).toBe(true);
  });

  it('returns false when authUser is null', () => {
    const rootStore = {} as never;
    const store = new SessionStore(rootStore);

    store.setAuthUser(null);

    expect(store.userOk).toBe(false);
  });
});