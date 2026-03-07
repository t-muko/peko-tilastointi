import { describe, expect, it, vi } from 'vitest';

import ReeniFireStorter from '@stores/reeniStore';
import type { ReeniData, ReeniRepository } from '@stores/repositories/reeniRepository';

function createRootStoreStub() {
  return {
    sessionStore: {},
    firebase: {},
  } as any;
}

describe('ReeniFireStorter with repository abstraction', () => {
  /**
   * Given a store with a mock repository
   * When changePath is called
   * Then store delegates path change to repository and refreshes collection.
   */
  it('given mock repository when changing path then delegates and updates collection reference', () => {
    const firstCollection = { docs: [] };
    const secondCollection = { docs: [{ id: 'x' }] };
    const setPath = vi.fn();
    const getCollection = vi
      .fn()
      .mockReturnValueOnce(firstCollection)
      .mockReturnValueOnce(secondCollection);

    const repository: ReeniRepository = {
      setPath,
      getCollection,
      add: vi.fn(),
    };

    const store = new ReeniFireStorter(createRootStoreStub(), repository);
    store.changePath('reenit/u1/reenit');

    expect(setPath).toHaveBeenCalledWith('reenit/u1/reenit');
    expect(store.reenit).toBe(secondCollection);
    expect(store.path).toBe('reenit/u1/reenit');
  });

  /**
   * Given a store with a mock repository
   * When addReeni is called
   * Then store delegates add operation to repository.
   */
  it('given mock repository when adding reeni then delegates to repository', async () => {
    const add = vi.fn().mockResolvedValue({ id: 'new-id' });
    const repository: ReeniRepository = {
      setPath: vi.fn(),
      getCollection: vi.fn(() => ({ docs: [] })),
      add,
    };

    const store = new ReeniFireStorter(createRootStoreStub(), repository);
    const item: ReeniData = {
      pvm: '2026-03-07',
      tunnit: 1,
      kommentti: 'testi',
      kategoria: 'Muu reeni',
      koira: 'Ei koiraa',
    };

    await store.addReeni(item);

    expect(add).toHaveBeenCalledWith(item);
  });

  /**
   * Given a store with a mock repository
   * When addDefaultReeni is called
   * Then store adds a default entry payload through the repository.
   */
  it('given mock repository when adding default reeni then delegates default payload', async () => {
    const add = vi.fn().mockResolvedValue({ id: 'new-id' });
    const repository: ReeniRepository = {
      setPath: vi.fn(),
      getCollection: vi.fn(() => ({ docs: [] })),
      add,
    };

    const store = new ReeniFireStorter(createRootStoreStub(), repository);
    await store.addDefaultReeni();

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({
        tunnit: 0,
        kommentti: '',
        kategoria: '',
        koira: 'Ei koiraa',
      })
    );
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({
        pvm: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      })
    );
  });
});
