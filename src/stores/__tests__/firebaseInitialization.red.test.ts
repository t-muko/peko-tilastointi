import { afterEach, describe, expect, it, vi } from 'vitest';

type MockUser = { uid: string; getIdToken: () => Promise<string> };

afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
});

describe('Regression tests - Firebase emulator wiring', () => {
    /**
     * Given emulator mode is enabled in environment
     * When Firebase service is constructed with local stores
     * Then Auth and Firestore are connected to local emulator endpoints.
     */
    it('given emulator mode when creating firebase service then connects local auth and firestore emulators', async () => {
        vi.stubEnv('VITE_USE_EMULATOR', 'true');

        const initializeApp = vi.fn(() => ({ name: '[DEFAULT]' }));
        const connectAuthEmulator = vi.fn();
        const connectFirestoreEmulator = vi.fn();
        const getFirestore = vi.fn(() => ({ id: 'firestore-instance' }));

        vi.doMock('firebase/compat/app', () => ({
            default: {
                initializeApp,
                apps: [],
            },
        }));
        vi.doMock('firebase/compat/auth', () => ({}));
        vi.doMock('firebase/compat/firestore', () => ({}));
        vi.doMock('firebase/firestore', () => ({
            getFirestore,
            connectFirestoreEmulator,
        }));

        vi.doMock('firebase/auth', () => ({
            getAuth: vi.fn(() => ({ languageCode: '' })),
            onAuthStateChanged: vi.fn((_auth: unknown, cb: (user: MockUser | null) => void) => {
                cb(null);
                return vi.fn();
            }),
            GoogleAuthProvider: class {},
            signInWithPopup: vi.fn(),
            signOut: vi.fn(),
            signInWithEmailAndPassword: vi.fn(),
            connectAuthEmulator,
        }));

        const { default: Firebase } = await import('@components/Firebase/Firebase');

        const rootStoreStub = {
            sessionStore: { setAuthUser: vi.fn() },
            reeniFirestore: { changePath: vi.fn() },
        };

        new Firebase(rootStoreStub as never);

        expect(connectAuthEmulator).toHaveBeenCalledWith(
            expect.anything(),
            'http://localhost:9099',
            { disableWarnings: true }
        );
        expect(connectFirestoreEmulator).toHaveBeenCalledWith(
            expect.anything(),
            'localhost',
            8080
        );
    });

    /**
     * Given auth state callback receives a logged in user
     * When Firebase service handles auth change
     * Then it updates collection path to the user-specific path.
     */
    it('given logged in user when auth state changes then switches to user path', async () => {
        vi.stubEnv('VITE_USE_EMULATOR', 'false');

        vi.doMock('firebase/compat/app', () => ({
            default: {
                initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
                apps: [],
            },
        }));
        vi.doMock('firebase/compat/auth', () => ({}));
        vi.doMock('firebase/compat/firestore', () => ({}));
        vi.doMock('firebase/firestore', () => ({
            getFirestore: vi.fn(() => ({ id: 'firestore-instance' })),
            connectFirestoreEmulator: vi.fn(),
        }));

        const user: MockUser = {
            uid: 'uid-123',
            getIdToken: vi.fn().mockResolvedValue('token'),
        };

        vi.doMock('firebase/auth', () => ({
            getAuth: vi.fn(() => ({ languageCode: '' })),
            onAuthStateChanged: vi.fn((_auth: unknown, cb: (authUser: MockUser | null) => void) => {
                cb(user);
                return vi.fn();
            }),
            GoogleAuthProvider: class {},
            signInWithPopup: vi.fn(),
            signOut: vi.fn(),
            signInWithEmailAndPassword: vi.fn(),
            connectAuthEmulator: vi.fn(),
        }));

        const { default: Firebase } = await import('@components/Firebase/Firebase');

        const changePath = vi.fn();
        const setAuthUser = vi.fn();
        const rootStoreStub = {
            sessionStore: { setAuthUser },
            reeniFirestore: { changePath },
        };

        new Firebase(rootStoreStub as never);

        expect(setAuthUser).toHaveBeenCalledWith(user);
        await vi.waitFor(() => {
            expect(changePath).toHaveBeenCalledWith('reenit/uid-123/reenit');
        });
    });

    /**
     * Given getIdToken fails during auth change
     * When Firebase service handles the callback
     * Then it still switches collection path to the user-specific path.
     */
    it('given token refresh failure when auth state changes then still switches to user path', async () => {
        vi.stubEnv('VITE_USE_EMULATOR', 'false');

        vi.doMock('firebase/compat/app', () => ({
            default: {
                initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
                apps: [],
            },
        }));
        vi.doMock('firebase/compat/auth', () => ({}));
        vi.doMock('firebase/compat/firestore', () => ({}));
        vi.doMock('firebase/firestore', () => ({
            getFirestore: vi.fn(() => ({ id: 'firestore-instance' })),
            connectFirestoreEmulator: vi.fn(),
        }));

        const user: MockUser = {
            uid: 'uid-fallback',
            getIdToken: vi.fn().mockRejectedValue(new Error('token failed')),
        };

        vi.doMock('firebase/auth', () => ({
            getAuth: vi.fn(() => ({ languageCode: '' })),
            onAuthStateChanged: vi.fn((_auth: unknown, cb: (authUser: MockUser | null) => void) => {
                cb(user);
                return vi.fn();
            }),
            GoogleAuthProvider: class {},
            signInWithPopup: vi.fn(),
            signOut: vi.fn(),
            signInWithEmailAndPassword: vi.fn(),
            connectAuthEmulator: vi.fn(),
        }));

        const { default: Firebase } = await import('@components/Firebase/Firebase');

        const changePath = vi.fn();
        const setAuthUser = vi.fn();
        const rootStoreStub = {
            sessionStore: { setAuthUser },
            reeniFirestore: { changePath },
        };

        new Firebase(rootStoreStub as never);

        expect(setAuthUser).toHaveBeenCalledWith(user);
        await vi.waitFor(() => {
            expect(changePath).toHaveBeenCalledWith('reenit/uid-fallback/reenit');
        });
    });

    /**
     * Given a Firebase service instance with a logged-in session
     * When logout is called
     * Then it signs out and resets Firestore path to anonymous collection.
     */
    it('given firebase service when logging out then signs out and resets to anonymous path', async () => {
        vi.stubEnv('VITE_USE_EMULATOR', 'false');

        const signOut = vi.fn().mockResolvedValue(undefined);

        vi.doMock('firebase/compat/app', () => ({
            default: {
                initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
                apps: [],
            },
        }));
        vi.doMock('firebase/compat/auth', () => ({}));
        vi.doMock('firebase/compat/firestore', () => ({}));
        vi.doMock('firebase/firestore', () => ({
            getFirestore: vi.fn(() => ({ id: 'firestore-instance' })),
            connectFirestoreEmulator: vi.fn(),
        }));
        vi.doMock('firebase/auth', () => ({
            getAuth: vi.fn(() => ({ languageCode: '' })),
            onAuthStateChanged: vi.fn((_auth: unknown, cb: (authUser: MockUser | null) => void) => {
                cb(null);
                return vi.fn();
            }),
            GoogleAuthProvider: class {},
            signInWithPopup: vi.fn(),
            signOut,
            signInWithEmailAndPassword: vi.fn(),
            connectAuthEmulator: vi.fn(),
        }));

        const { default: Firebase } = await import('@components/Firebase/Firebase');

        const changePath = vi.fn();
        const rootStoreStub = {
            sessionStore: { setAuthUser: vi.fn() },
            reeniFirestore: { changePath },
        };

        const firebaseService = new Firebase(rootStoreStub as never);
        firebaseService.logout();

        expect(signOut).toHaveBeenCalledWith(firebaseService.auth);
        expect(changePath).toHaveBeenCalledWith('reenit/anonyymi/reenit');
    });

    /**
     * Given emulator mode is disabled
     * When autentikoiTestissa is called
     * Then method throws because test auth is emulator-only.
     */
    it('given non-emulator mode when calling autentikoiTestissa then throws emulator-only error', async () => {
        vi.stubEnv('VITE_USE_EMULATOR', 'false');

        const signInWithEmailAndPassword = vi.fn();

        vi.doMock('firebase/compat/app', () => ({
            default: {
                initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
                apps: [],
            },
        }));
        vi.doMock('firebase/compat/auth', () => ({}));
        vi.doMock('firebase/compat/firestore', () => ({}));
        vi.doMock('firebase/firestore', () => ({
            getFirestore: vi.fn(() => ({ id: 'firestore-instance' })),
            connectFirestoreEmulator: vi.fn(),
        }));
        vi.doMock('firebase/auth', () => ({
            getAuth: vi.fn(() => ({ languageCode: '' })),
            onAuthStateChanged: vi.fn((_auth: unknown, cb: (authUser: MockUser | null) => void) => {
                cb(null);
                return vi.fn();
            }),
            GoogleAuthProvider: class {},
            signInWithPopup: vi.fn(),
            signOut: vi.fn(),
            signInWithEmailAndPassword,
            connectAuthEmulator: vi.fn(),
        }));

        const { default: Firebase } = await import('@components/Firebase/Firebase');

        const rootStoreStub = {
            sessionStore: { setAuthUser: vi.fn() },
            reeniFirestore: { changePath: vi.fn() },
        };
        const firebaseService = new Firebase(rootStoreStub as never);

        await expect(firebaseService.autentikoiTestissa('test@example.com', 'secret')).rejects.toThrow(
            'autentikoiTestissa() on käytettävissä vain emulaattori-tilassa'
        );
        expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    });

    /**
     * Given emulator mode is enabled
     * When autentikoiTestissa is called
     * Then method delegates to Firebase email/password sign-in API.
     */
    it('given emulator mode when calling autentikoiTestissa then delegates to email password sign-in', async () => {
        vi.stubEnv('VITE_USE_EMULATOR', 'true');

        const signInResult = { user: { uid: 'emu-user' } };
        const signInWithEmailAndPassword = vi.fn().mockResolvedValue(signInResult);

        vi.doMock('firebase/compat/app', () => ({
            default: {
                initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
                apps: [],
            },
        }));
        vi.doMock('firebase/compat/auth', () => ({}));
        vi.doMock('firebase/compat/firestore', () => ({}));
        vi.doMock('firebase/firestore', () => ({
            getFirestore: vi.fn(() => ({ id: 'firestore-instance' })),
            connectFirestoreEmulator: vi.fn(),
        }));
        vi.doMock('firebase/auth', () => ({
            getAuth: vi.fn(() => ({ languageCode: '' })),
            onAuthStateChanged: vi.fn((_auth: unknown, cb: (authUser: MockUser | null) => void) => {
                cb(null);
                return vi.fn();
            }),
            GoogleAuthProvider: class {},
            signInWithPopup: vi.fn(),
            signOut: vi.fn(),
            signInWithEmailAndPassword,
            connectAuthEmulator: vi.fn(),
        }));

        const { default: Firebase } = await import('@components/Firebase/Firebase');

        const rootStoreStub = {
            sessionStore: { setAuthUser: vi.fn() },
            reeniFirestore: { changePath: vi.fn() },
        };
        const firebaseService = new Firebase(rootStoreStub as never);

        const result = await firebaseService.autentikoiTestissa('test@example.com', 'secret');

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(firebaseService.auth, 'test@example.com', 'secret');
        expect(result).toBe(signInResult);
    });
});

describe('New feature tests - Phase 1 centralized Firebase initialization', () => {
    /**
     * Given firebase default app has already been initialized in app bootstrap
     * When root store and dependent services are created
     * Then no duplicate initializeApp call should be attempted.
     */
    it('given already initialized default app when creating root store then does not throw duplicate initialization error', async () => {
        vi.stubEnv('VITE_USE_EMULATOR', 'false');

        const apps: Array<{ name: string }> = [];
        const initializeApp = vi.fn(() => {
            if (apps.length > 0) {
                throw new Error("Firebase App named '[DEFAULT]' already exists");
            }
            const app = { name: '[DEFAULT]' };
            apps.push(app);
            return app;
        });

        vi.doMock('firebase/compat/app', () => ({
            default: {
                initializeApp,
                apps,
            },
        }));
        vi.doMock('firebase/compat/auth', () => ({}));
        vi.doMock('firebase/compat/firestore', () => ({}));
        vi.doMock('firebase/firestore', () => ({
            getFirestore: vi.fn(() => ({})),
            connectFirestoreEmulator: vi.fn(),
        }));
        vi.doMock('firebase/auth', () => ({
            getAuth: vi.fn(() => ({ languageCode: '' })),
            onAuthStateChanged: vi.fn((_auth: unknown, cb: (user: MockUser | null) => void) => {
                cb(null);
                return vi.fn();
            }),
            GoogleAuthProvider: class {},
            signInWithPopup: vi.fn(),
            signOut: vi.fn(),
            signInWithEmailAndPassword: vi.fn(),
            connectAuthEmulator: vi.fn(),
        }));
        vi.doMock('firestorter', () => ({
            initFirestorter: vi.fn(),
            Collection: class {
                query: unknown;
                constructor(_path: string, _opts: unknown) {
                    this.query = null;
                }
            },
            Document: class {},
        }));

        await expect(import('@stores/index')).resolves.toBeDefined();
    });
});