import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mocked at module level — ReeniItem (rendered in edit mode) uses date pickers
// that would fail in jsdom without mocking. Mock it as a simple no-op.
vi.mock('@components/ReeniItem', () => ({
    default: () => <div data-testid="reeni-item-mock" />,
}));

import ReeniListItem from '@components/ReeniListItem';

function makeItem(overrides: Record<string, any> = {}) {
    return {
        id: 'item1',
        data: {
            pvm: '2024-03-15',
            tunnit: 1.5,
            kategoria: 'Jälki',
            koira: 'Ykköskoira',
            kommentti: 'Testikommentti',
            ...overrides,
        },
        update: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
    };
}

describe('ReeniListItem', () => {
    it('näyttää päivämäärän suomalaisessa muodossa', () => {
        render(<ReeniListItem item={makeItem()} />);
        expect(screen.getByText(/15\.3\.2024/)).toBeInTheDocument();
    });

    it('näyttää tunnit', () => {
        render(<ReeniListItem item={makeItem()} />);
        expect(screen.getByText('1.5 h')).toBeInTheDocument();
    });

    it('näyttää kategorian', () => {
        render(<ReeniListItem item={makeItem()} />);
        expect(screen.getByText('Jälki')).toBeInTheDocument();
    });

    it('ei näytä koiraa eikä kommenttia ilman expand-propia', () => {
        render(<ReeniListItem item={makeItem()} expand={false} />);
        expect(screen.queryByText('Ykköskoira')).not.toBeInTheDocument();
        expect(screen.queryByText('Testikommentti')).not.toBeInTheDocument();
    });

    it('näyttää koiran ja kommentin expand=true -tilassa', () => {
        render(<ReeniListItem item={makeItem()} expand={true} />);
        expect(screen.getByText('Ykköskoira')).toBeInTheDocument();
        expect(screen.getByText('Testikommentti')).toBeInTheDocument();
    });

    it('ei näytä tunteja jos tunnit on 0', () => {
        render(<ReeniListItem item={makeItem({ tunnit: 0 })} />);
        expect(screen.queryByText(/\d+ h/)).not.toBeInTheDocument();
    });
});
