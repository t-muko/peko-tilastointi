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

        vi.doMock('firebase/compat/app', () => ({
            default: {
                apps,
                initializeApp,
            },
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

        vi.doMock('firebase/compat/app', () => ({
            default: {
                apps: [existingApp],
                initializeApp,
            },
        }));

        const { getOrCreateFirebaseApp } = await import('../firebaseApp');

        const app = getOrCreateFirebaseApp();

        expect(app).toBe(existingApp);
        expect(initializeApp).not.toHaveBeenCalled();
    });
});