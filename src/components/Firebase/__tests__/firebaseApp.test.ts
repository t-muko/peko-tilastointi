import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
});

describe('firebaseApp singleton initialization', () => {
    it('initializes app once when no apps exist and reuses it on subsequent calls', async () => {
        const apps: Array<{ name: string }> = [];
        const initializeApp = vi.fn(() => {
            const app = { name: '[DEFAULT]' };
            apps.push(app);
            return app;
        });
        const getApps = vi.fn(() => apps);
        const getApp = vi.fn(() => apps[0]);

        vi.doMock('firebase/app', () => ({
            getApps,
            getApp,
            initializeApp,
        }));

        const { getOrCreateFirebaseApp } = await import('../firebaseApp');

        const first = getOrCreateFirebaseApp();
        const second = getOrCreateFirebaseApp();

        expect(initializeApp).toHaveBeenCalledTimes(1);
        expect(first).toBe(second);
        expect(first).toEqual({ name: '[DEFAULT]' });
    });

    it('returns existing default app without calling initializeApp', async () => {
        const existingApp = { name: '[DEFAULT]' };
        const initializeApp = vi.fn();
        const getApps = vi.fn(() => [existingApp]);
        const getApp = vi.fn(() => existingApp);

        vi.doMock('firebase/app', () => ({
            getApps,
            getApp,
            initializeApp,
        }));

        const { getOrCreateFirebaseApp } = await import('../firebaseApp');

        const app = getOrCreateFirebaseApp();

        expect(app).toBe(existingApp);
        expect(initializeApp).not.toHaveBeenCalled();
    });
});

describe('firebaseConfig.authDomain follows the serving origin', () => {
    const originalLocation = window.location;

    afterEach(() => {
        Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    });

    /**
     * Given the app is loaded from peko-tilastointi.web.app
     * When firebaseConfig is read
     * Then authDomain matches that host, so Auth's redirect/popup flow
     * never has to cross origins via a storage-dependent relay.
     */
    it('given app served from web.app when firebaseConfig is read then authDomain is web.app', async () => {
        Object.defineProperty(window, 'location', {
            value: { hostname: 'peko-tilastointi.web.app' },
            writable: true,
        });

        const { firebaseConfig } = await import('../firebaseApp');

        expect(firebaseConfig.authDomain).toBe('peko-tilastointi.web.app');
    });

    /**
     * Given the app is loaded from peko-tilastointi.firebaseapp.com
     * When firebaseConfig is read
     * Then authDomain matches that host too — both default Firebase Hosting
     * domains must work without a cross-origin Auth handshake.
     */
    it('given app served from firebaseapp.com when firebaseConfig is read then authDomain is firebaseapp.com', async () => {
        Object.defineProperty(window, 'location', {
            value: { hostname: 'peko-tilastointi.firebaseapp.com' },
            writable: true,
        });

        const { firebaseConfig } = await import('../firebaseApp');

        expect(firebaseConfig.authDomain).toBe('peko-tilastointi.firebaseapp.com');
    });
});
