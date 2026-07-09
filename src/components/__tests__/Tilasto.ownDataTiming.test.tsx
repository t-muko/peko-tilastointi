import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { makeAutoObservable } from 'mobx';

// --- Mocks (hoisted before imports) ---

let resolveReady: () => void;

vi.mock('firestorter', () => ({
    Collection: class {
        docs: any[] = [];
        isLoading = false;
        constructor() { }
    },
    Document: class {
        // Mirrors firestorter: data starts as an empty placeholder before the
        // first snapshot arrives, even though the Document object already exists.
        data: any = {};
        ready() {
            return new Promise<void>((resolve) => { resolveReady = resolve; });
        }
        constructor() { }
    },
}));

vi.mock('react-google-charts', () => ({ Chart: () => null }));

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
    authTokenReady = true;

    constructor() {
        makeAutoObservable(this);
    }

    get userOk() {
        return !!(this.authUser && this.authUser.uid);
    }
}

async function renderTilasto() {
    const sessionStore = new FakeSessionStore();
    const rootStore = {
        sessionStore,
        reeniFirestore: { reenit: { docs: [] } },
    };
    await act(async () => {
        render(
            <FirebaseContext.Provider value={{ rootStore }}>
                <Tilasto />
            </FirebaseContext.Provider>
        );
    });
}

describe('Tilasto — oman tilastodokumentin ensimmäisen snapshotin odotus (regression)', () => {
    it('ei näytä "Oma yhdistys" -tekstiä (eikä siten PUUTTUU!-oletusarvoa) ennen kuin oma dokumentti on ladattu, vaikka auth on jo valmis', async () => {
        await renderTilasto();

        // authTokenReady is already true (unlike the earlier race) — tilastoDokumentti
        // exists, but its first snapshot hasn't arrived (ready() hasn't resolved yet).
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByText(/Oma yhdistys:/)).not.toBeInTheDocument();

        await act(async () => {
            resolveReady();
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(screen.getByText(/Oma yhdistys:/)).toBeInTheDocument();
        });
    });
});
