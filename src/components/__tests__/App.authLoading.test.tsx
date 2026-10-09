import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { makeAutoObservable } from 'mobx';

vi.mock('@components/Reenit', () => ({ default: () => <div>reenit-stub</div> }));
vi.mock('@components/Tilasto', () => ({ default: () => <div>tilasto-stub</div> }));
vi.mock('@components/Info', () => ({ default: () => <div>info-stub</div> }));

import FirebaseContext from '@components/Firebase/context';
import App from '@components/App';

class FakeSessionStore {
    authResolved = false;
    authUser: { uid: string; email: string } | null = null;

    constructor(initial: Partial<FakeSessionStore> = {}) {
        makeAutoObservable(this);
        Object.assign(this, initial);
    }

    get userOk() {
        return !!(this.authUser && this.authUser.uid);
    }
}

function renderApp(sessionStore: FakeSessionStore) {
    const rootStore = {
        sessionStore,
        firebase: { autentikoi: vi.fn(), logout: vi.fn() },
        reeniFirestore: { addDefaultReeni: vi.fn() },
    };
    return render(
        <FirebaseContext.Provider value={{ rootStore }}>
            <App />
        </FirebaseContext.Provider>
    );
}

describe('App — auth resolution loading state (regression)', () => {
    /**
     * Given Firebase has not yet resolved the initial auth state (e.g. right
     * after a redirect sign-in completes and the page reloads)
     * When App renders
     * Then it shows a loading indicator instead of the Login button, so a
     * returning signed-in user never sees a flash of "Login".
     */
    it('does not show the Login button while auth state is unresolved', () => {
        renderApp(new FakeSessionStore({ authResolved: false }));

        expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    /**
     * Given auth state resolved to "signed out"
     * When App renders
     * Then it shows the Login button.
     */
    it('shows the Login button once auth state resolves to signed out', () => {
        renderApp(new FakeSessionStore({ authResolved: true, authUser: null }));

        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    /**
     * Given auth state resolved to "signed in"
     * When App renders
     * Then it shows the main content and never the Login button.
     */
    it('shows main content and no Login button once auth state resolves to signed in', () => {
        renderApp(new FakeSessionStore({ authResolved: true, authUser: { uid: 'u1', email: 'kaisa@example.com' } }));

        expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
        expect(screen.getByText('reenit-stub')).toBeInTheDocument();
    });
});
