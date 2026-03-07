import React from 'react';
import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { useStores } from '@hooks/use-stores';
import { FirebaseContext } from '@components/Firebase/Firebase';

describe('useStores', () => {
  /**
   * Given component is rendered inside FirebaseContext provider
   * When useStores hook is called
   * Then hook returns provider rootStore value.
   */
  it('given provider when using hook then returns rootStore', () => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

    let observedStore: any = null;
    function Probe() {
      observedStore = useStores();
      return null;
    }

    const rootStore = { name: 'root-store' };
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(
        <FirebaseContext.Provider value={{ rootStore }}>
          <Probe />
        </FirebaseContext.Provider>
      );
    });

    expect(observedStore).toBe(rootStore);

    act(() => {
      root.unmount();
    });
  });

  /**
   * Given component is not wrapped in FirebaseContext provider
   * When useStores hook is called
   * Then hook throws a descriptive error.
   */
  it('given no provider when using hook then throws', () => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

    const container = document.createElement('div');
    const root = createRoot(container);

    function Probe() {
      useStores();
      return null;
    }

    expect(() => {
      act(() => {
        root.render(<Probe />);
      });
    }).toThrow('useStores must be used inside FirebaseContext.Provider');

    act(() => {
      root.unmount();
    });
  });
});
