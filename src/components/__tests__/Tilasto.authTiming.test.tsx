import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeAutoObservable, runInAction } from 'mobx';

// --- Mocks (hoisted before imports) ---

const documentCtor = vi.fn();
const collectionCtor = vi.fn();

vi.mock('firestorter', () => ({
    Collection: class {
        docs: any[] = [];
        isLoading = false;
        constructor(...args: any[]) { collectionCtor(...args); }
    },
    Document: class {
        data: any = {};
        constructor(...args: any[]) { documentCtor(...args); }
    },
}));

vi.mock('react-google-charts', () => ({ Chart: () => null }));

// jsdom has no matchMedia implementation; Tilasto.render() checks it for mobile layout.
window.matchMedia = window.matchMedia || ((query: string) => ({
    matches: false,
    media: query,
    addListener: () => { },
    removeListener: () => { },
})) as any;

// --- Imports (after vi.mock calls, which are hoisted by Vitest) ---

import FirebaseContext from '@components/Firebase/context';
import Tilasto from '@components/Tilasto';

class FakeSessionStore {
    authUser: { uid: string } | null = { uid: 'user-1' };
    authTokenReady = false;

    constructor() {
        makeAutoObservable(this);
    }

    get userOk() {
        return !!(this.authUser && this.authUser.uid);
    }
}

function renderTilasto(sessionStore: FakeSessionStore) {
    const rootStore = {
        sessionStore,
        reeniFirestore: { reenit: { docs: [] } },
    };
    return render(
        <FirebaseContext.Provider value={{ rootStore }}>
            <Tilasto />
        </FirebaseContext.Provider>
    );
}

describe('Tilasto — auth token timing race (regression)', () => {
    beforeEach(() => {
        documentCtor.mockClear();
        collectionCtor.mockClear();
    });

    it('does not subscribe to Firestore before the auth token is ready', () => {
        const sessionStore = new FakeSessionStore();
        renderTilasto(sessionStore);

        expect(documentCtor).not.toHaveBeenCalled();
        expect(collectionCtor).not.toHaveBeenCalled();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('subscribes to Firestore once the auth token becomes ready', async () => {
        const sessionStore = new FakeSessionStore();
        renderTilasto(sessionStore);

        act(() => {
            runInAction(() => {
                sessionStore.authTokenReady = true;
            });
        });

        await waitFor(() => {
            expect(documentCtor).toHaveBeenCalledWith('tilastot/user-1');
        });
        expect(collectionCtor).toHaveBeenCalledWith('tilastot');
    });

    it('never subscribes if the auth token never becomes ready', async () => {
        const sessionStore = new FakeSessionStore();
        renderTilasto(sessionStore);

        // Give any (incorrect) eager subscription a chance to happen.
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(documentCtor).not.toHaveBeenCalled();
        expect(collectionCtor).not.toHaveBeenCalled();
    });
});
