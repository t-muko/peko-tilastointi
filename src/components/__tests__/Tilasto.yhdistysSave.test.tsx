import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeAutoObservable, runInAction } from 'mobx';

// --- Mocks (hoisted before imports) ---

const setMock = vi.fn();

vi.mock('firestorter', () => ({
    Collection: class {
        docs: any[] = [];
        isLoading = false;
        constructor() { }
    },
    Document: class {
        data: any = { yhd: '' };
        set(...args: any[]) { return setMock(...args); }
        ready() { return Promise.resolve(); }
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

async function openEditDialogAndPickClub(clubLabel: string) {
    await waitFor(() => expect(screen.getByText(/Oma yhdistys:/)).toBeInTheDocument());

    const editButton = screen.getByText(/Oma yhdistys:/).closest('p')!.querySelector('button')!;
    fireEvent.click(editButton);

    const input = await screen.findByRole('combobox', { name: 'Oma yhdistys' });
    fireEvent.change(input, { target: { value: clubLabel } });
    const option = await screen.findByText(clubLabel);
    fireEvent.click(option);
}

describe('Tilasto — oman yhdistyksen tallennuksen virheenkäsittely (regression)', () => {
    beforeEach(() => {
        setMock.mockReset();
    });

    it('sulkee dialogin kun tallennus onnistuu', async () => {
        setMock.mockResolvedValue(undefined);
        await renderTilasto();

        await act(async () => {
            await openEditDialogAndPickClub('Action ry');
        });

        await waitFor(() => {
            expect(setMock).toHaveBeenCalledWith({ yhd: 'Action ry' }, { merge: true });
        });
        await waitFor(() => {
            expect(screen.queryByRole('combobox', { name: 'Oma yhdistys' })).not.toBeInTheDocument();
        });
        expect(screen.queryByText(/Tallennus epäonnistui/)).not.toBeInTheDocument();
    });

    it('näyttää virheen eikä sulje dialogia kun tallennus epäonnistuu', async () => {
        setMock.mockRejectedValue(new Error('permission-denied'));
        await renderTilasto();

        await act(async () => {
            await openEditDialogAndPickClub('Action ry');
        });

        await waitFor(() => {
            expect(screen.getByText(/Tallennus epäonnistui/)).toBeInTheDocument();
        });
        // Dialog stays open so the user can retry, instead of silently losing the selection.
        expect(screen.getByRole('combobox', { name: 'Oma yhdistys' })).toBeInTheDocument();
    });
});
