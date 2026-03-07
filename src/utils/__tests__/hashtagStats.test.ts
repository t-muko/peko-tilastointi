import { describe, it, expect } from 'vitest';
import { buildHashtagStats, type ReeniForHashtagStats } from '../hashtagStats';

function makeReeni(overrides: Partial<NonNullable<ReeniForHashtagStats['data']>> = {}): ReeniForHashtagStats {
    return {
        data: {
            pvm: '2026-03-06',
            kommentti: '',
            tunnit: 0,
            ...overrides,
        },
    };
}

describe('Regression tests - buildHashtagStats', () => {
    /**
     * Given year-filtered data without hashtags
     * When hashtag stats are built
     * Then result is an empty object.
     */
    it('given no hashtags when building then returns empty stats', () => {
        const reenit = [makeReeni({ kommentti: 'ei tageja', pvm: '2026-01-01', tunnit: 2 })];

        const result = buildHashtagStats(reenit, 2026);

        expect(result).toEqual({});
    });
});

describe('New feature tests - buildHashtagStats', () => {
    /**
     * Given multiple entries in same year and one entry in another year
     * When hashtag stats are built for selected year
     * Then only selected year contributes and H/X sums are correct.
     */
    it('given mixed years when building then applies year filter and sums H and X', () => {
        const reenit = [
            makeReeni({ pvm: '2026-01-10', kommentti: 'Aamu #haku #jalki', tunnit: 1.5 }),
            makeReeni({ pvm: '2026-02-11', kommentti: 'Ilta #haku', tunnit: 2 }),
            makeReeni({ pvm: '2025-12-31', kommentti: 'Vanha #haku #x', tunnit: 10 }),
        ];

        const result = buildHashtagStats(reenit, 2026);

        expect(result).toEqual({
            haku: { H: 3.5, X: 2 },
            jalki: { H: 1.5, X: 1 },
        });
    });

    /**
     * Given one entry with duplicate hashtags in same comment
     * When hashtag stats are built
     * Then duplicate hashtag contributes once for X and once for H in that entry.
     */
    it('given duplicate hashtags in one comment when building then counts entry once per hashtag', () => {
        const reenit = [
            makeReeni({ pvm: '2026-05-05', kommentti: '#haku #haku #HAKU', tunnit: 3 }),
        ];

        const result = buildHashtagStats(reenit, 2026);

        expect(result).toEqual({
            haku: { H: 3, X: 1 },
        });
    });

    /**
     * Given entry with missing hours
     * When hashtag stats are built
     * Then hours default to zero while occurrence count is incremented.
     */
    it('given missing hours when building then defaults H increment to zero', () => {
        const reenit = [
            makeReeni({ pvm: '2026-07-01', kommentti: 'Tehtiin #x', tunnit: undefined }),
        ];

        const result = buildHashtagStats(reenit, 2026);

        expect(result).toEqual({
            x: { H: 0, X: 1 },
        });
    });

    /**
     * Given hashtags with Finnish letters across entries
     * When hashtag stats are built
     * Then normalized hashtags aggregate under lowercase Finnish forms.
     */
    it('given finnish hashtags when building then aggregates normalized forms', () => {
        const reenit = [
            makeReeni({ pvm: '2026-08-01', kommentti: '#Äly #Öljy', tunnit: 1 }),
            makeReeni({ pvm: '2026-09-01', kommentti: '#äly', tunnit: 2 }),
        ];

        const result = buildHashtagStats(reenit, 2026);

        expect(result).toEqual({
            'äly': { H: 3, X: 2 },
            'öljy': { H: 1, X: 1 },
        });
    });
});
