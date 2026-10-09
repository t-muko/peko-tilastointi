import { afterEach, describe, expect, it, vi } from 'vitest';

type MockUser = { uid: string; getIdToken: () => Promise<string> };

afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
});

function mockAppAndFirestore() {
    vi.doMock('firebase/app', () => ({
        getApps: vi.fn(() => []),
        getApp: vi.fn(),
        initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
    }));
    vi.doMock('firebase/firestore', () => ({
        getFirestore: vi.fn(() => ({ id: 'firestore-instance' })),
        connectFirestoreEmulator: vi.fn(),
    }));
}

describe('Firebase.autentikoi — redirect-based Google sign-in', () => {
    /**
     * Given a user triggers login
     * When autentikoi() is called
     * Then it starts a redirect sign-in instead of a popup, which does not
     * depend on third-party storage access between a popup and its opener
     * (the failure mode behind "requires several clicks to log in" on
     * Android Chrome / installed PWA).
     */
    it('given login requested when autentikoi is called then uses signInWithRedirect, not a popup', async () => {
        vi.stubEnv('VITE_USE_EMULATOR', 'false');
        mockAppAndFirestore();

        const signInWithRedirect = vi.fn().mockResolvedValue(undefined);
        const signInWithPopup = vi.fn();

        vi.doMock('firebase/auth', () => ({
            getAuth: vi.fn(() => ({ languageCode: '' })),
            onAuthStateChanged: vi.fn((_auth: unknown, cb: (user: MockUser | null) => void) => {
                cb(null);
                return vi.fn();
            }),
            getRedirectResult: vi.fn().mockResolvedValue(null),
            GoogleAuthProvider: class { },
            signInWithRedirect,
            signInWithPopup,
            signOut: vi.fn(),
            signInWithEmailAndPassword: vi.fn(),
            connectAuthEmulator: vi.fn(),
        }));

        const { default: Firebase } = await import('@components/Firebase/firebaseService');

        const rootStoreStub = {
            sessionStore: { setAuthUser: vi.fn(), setAuthResolved: vi.fn(), setAuthTokenReady: vi.fn() },
            reeniFirestore: { changePath: vi.fn() },
        };

        const firebaseService = new Firebase(rootStoreStub as never);
        firebaseService.autentikoi();

        expect(signInWithRedirect).toHaveBeenCalledWith(firebaseService.auth, firebaseService.provider);
        expect(signInWithPopup).not.toHaveBeenCalled();
    });

    /**
     * Given the app has just loaded back after a redirect sign-in
     * When Firebase service is constructed
     * Then it consumes the pending redirect result so any sign-in error
     * (e.g. account-exists-with-different-credential) is surfaced instead
     * of silently dropped.
     */
    it('given pending redirect result when Firebase service is constructed then it resolves the redirect result', async () => {
        vi.stubEnv('VITE_USE_EMULATOR', 'false');
        mockAppAndFirestore();

        const getRedirectResult = vi.fn().mockResolvedValue(null);

        vi.doMock('firebase/auth', () => ({
            getAuth: vi.fn(() => ({ languageCode: '' })),
            onAuthStateChanged: vi.fn((_auth: unknown, cb: (user: MockUser | null) => void) => {
                cb(null);
                return vi.fn();
            }),
            getRedirectResult,
            GoogleAuthProvider: class { },
            signInWithRedirect: vi.fn(),
            signInWithPopup: vi.fn(),
            signOut: vi.fn(),
            signInWithEmailAndPassword: vi.fn(),
            connectAuthEmulator: vi.fn(),
        }));

        const { default: Firebase } = await import('@components/Firebase/firebaseService');

        const rootStoreStub = {
            sessionStore: { setAuthUser: vi.fn(), setAuthResolved: vi.fn(), setAuthTokenReady: vi.fn() },
            reeniFirestore: { changePath: vi.fn() },
        };

        const firebaseService = new Firebase(rootStoreStub as never);

        await vi.waitFor(() => {
            expect(getRedirectResult).toHaveBeenCalledWith(firebaseService.auth);
        });
    });
});
