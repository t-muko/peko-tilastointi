import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Firebase / firestorter mocks (hoisted before imports) ---

vi.mock('firebase/compat/app', () => {
    const firebase = {
        initializeApp: vi.fn().mockReturnValue({}),
        apps: [] as any[],
    };
    return { default: firebase };
});
vi.mock('firebase/compat/auth', () => ({}));
vi.mock('firebase/compat/firestore', () => ({}));
vi.mock('firebase/firestore', () => ({ getFirestore: vi.fn() }));
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({ languageCode: '' })),
    onAuthStateChanged: vi.fn((_auth: any, cb: (u: null) => void) => { cb(null); return vi.fn(); }),
    GoogleAuthProvider: class { },
    signInWithPopup: vi.fn().mockResolvedValue({}),
    signOut: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('firestorter', () => ({
    initFirestorter: vi.fn(),
    Collection: class {
        docs: any[] = [];
        isLoading = false;
        query: any = null;
        path = '';
        add = vi.fn().mockResolvedValue(undefined);
    },
    Document: class {
        id = 'mock-doc';
        path = '';
        data: Record<string, any> = {};
        set = vi.fn().mockResolvedValue(undefined);
        update = vi.fn().mockResolvedValue(undefined);
        delete = vi.fn().mockResolvedValue(undefined);
        constructor(p = '') { this.path = p; }
    },
}));

// ReeniItem uses MUI date pickers that don't play well with jsdom — mock it
vi.mock('@components/ReeniItem', () => ({
    default: () => <div data-testid="reeni-item-mock" />,
}));

// --- Imports (after vi.mock calls which are hoisted by Vitest) ---

import FirebaseContext from '@components/Firebase/context';
import Reenit from '@components/Reenit';

// --- Helpers ---

function makeDoc(id: string, overrides: Record<string, any> = {}) {
    return {
        id,
        data: {
            pvm: '2024-03-15',
            tunnit: 1,
            kategoria: 'Jälki',
            koira: 'Ykköskoira',
            kommentti: '',
            ...overrides,
        },
        update: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
    };
}

const DOCS = [
    makeDoc('doc1', { pvm: '2024-03-15', koira: 'Ykköskoira', kategoria: 'Jälki', kommentti: 'Metsäharjoitus', tunnit: 1 }),
    makeDoc('doc2', { pvm: '2024-06-20', koira: 'Kakkoskoira', kategoria: 'Partsa', kommentti: 'Kentällä', tunnit: 2 }),
    makeDoc('doc3', { pvm: '2023-11-05', koira: 'Ykköskoira', kategoria: 'Ilmavainu', kommentti: 'Sisäharjoitus', tunnit: 1.5 }),
];

function makeFakeRootStore(docs = DOCS) {
    return {
        sessionStore: {
            authUser: { uid: 'test-uid-123', email: 'testi@test.com' },
            userOk: true,
        },
        reeniFirestore: {
            reenit: {
                docs,
                isLoading: false,
                add: vi.fn().mockResolvedValue(undefined),
            },
            path: 'reenit/test-uid-123/reenit',
        },
    };
}

function renderReenit(docs = DOCS) {
    const store = makeFakeRootStore(docs);
    return render(
        <FirebaseContext.Provider value={{ rootStore: store }}>
            <Reenit />
        </FirebaseContext.Provider>
    );
}

// --- Tests ---

describe('Reenit — hakusuodatus', () => {
    it('näyttää kaikki kirjaukset ilman hakua', () => {
        renderReenit();
        expect(screen.getByText('Jälki')).toBeInTheDocument();
        expect(screen.getByText('Partsa')).toBeInTheDocument();
        expect(screen.getByText('Ilmavainu')).toBeInTheDocument();
    });

    it('suodattaa kategorian perusteella', () => {
        renderReenit();
        const input = screen.getByPlaceholderText(/Hae esim/i);
        fireEvent.change(input, { target: { value: 'Jälki' } });

        expect(screen.getByText('Jälki')).toBeInTheDocument();
        expect(screen.queryByText('Partsa')).not.toBeInTheDocument();
        expect(screen.queryByText('Ilmavainu')).not.toBeInTheDocument();
    });

    it('suodattaa koiran nimen perusteella', () => {
        renderReenit();
        const input = screen.getByPlaceholderText(/Hae esim/i);
        fireEvent.change(input, { target: { value: 'Kakkoskoira' } });

        expect(screen.getByText('Partsa')).toBeInTheDocument();
        expect(screen.queryByText('Jälki')).not.toBeInTheDocument();
        expect(screen.queryByText('Ilmavainu')).not.toBeInTheDocument();
    });

    it('suodattaa AND-logiikalla — useampi hakusana', () => {
        renderReenit();
        const input = screen.getByPlaceholderText(/Hae esim/i);
        // "Ykköskoira" löytyy doc1 ja doc3:sta — lisätään "Ilmavainu" jolloin vain doc3 jää
        fireEvent.change(input, { target: { value: 'Ykköskoira Ilmavainu' } });

        expect(screen.getByText('Ilmavainu')).toBeInTheDocument();
        expect(screen.queryByText('Jälki')).not.toBeInTheDocument();
        expect(screen.queryByText('Partsa')).not.toBeInTheDocument();
    });

    it('tyhjentää haun tyhjennysnapista', () => {
        renderReenit();
        const input = screen.getByPlaceholderText(/Hae esim/i);
        fireEvent.change(input, { target: { value: 'Partsa' } });

        // Vain Partsa näkyy
        expect(screen.getByText('Partsa')).toBeInTheDocument();
        expect(screen.queryByText('Jälki')).not.toBeInTheDocument();

        // Tyhjennysnappi — aria-label="Clear"
        const clearBtn = screen.getByRole('button', { name: /clear/i });
        fireEvent.click(clearBtn);

        // Kaikki takaisin
        expect(screen.getByText('Jälki')).toBeInTheDocument();
        expect(screen.getByText('Partsa')).toBeInTheDocument();
        expect(screen.getByText('Ilmavainu')).toBeInTheDocument();
    });

    it('suodattaa vuoden perusteella', () => {
        renderReenit();
        const input = screen.getByPlaceholderText(/Hae esim/i);
        // doc3 on vuodelta 2023
        fireEvent.change(input, { target: { value: '2023' } });

        expect(screen.getByText('Ilmavainu')).toBeInTheDocument();
        expect(screen.queryByText('Jälki')).not.toBeInTheDocument();
        expect(screen.queryByText('Partsa')).not.toBeInTheDocument();
    });

    it('näyttää tyhjän listan jos mikään ei täsmää', () => {
        renderReenit();
        const input = screen.getByPlaceholderText(/Hae esim/i);
        fireEvent.change(input, { target: { value: 'xxxx-ei-löydy' } });

        expect(screen.queryByText('Jälki')).not.toBeInTheDocument();
        expect(screen.queryByText('Partsa')).not.toBeInTheDocument();
        expect(screen.queryByText('Ilmavainu')).not.toBeInTheDocument();
    });
});
