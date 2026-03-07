import { describe, expect, it, vi } from 'vitest';
import { App } from '@components/App';

describe('App add command', () => {
  /**
   * Given App receives rootStore through context
   * When add action is triggered
   * Then App delegates entry creation to store command.
   */
  it('given mocked store when pressing add then calls addDefaultReeni', async () => {
    const addDefaultReeni = vi.fn().mockResolvedValue(undefined);

    const app = new App({});
    (app as any).context = {
      rootStore: {
        reeniFirestore: {
          addDefaultReeni,
        },
      },
    };

    await app.onPressAdd();

    expect(addDefaultReeni).toHaveBeenCalledTimes(1);
  });
});
