import { describe, expect, it } from 'vitest';
import { buildAkmStats, type ReeniForAkmStats } from '../akmStats';

function makeReeni(overrides: Partial<NonNullable<ReeniForAkmStats['data']>> = {}): ReeniForAkmStats {
    return {
        data: {
            pvm: '2026-01-01',
            tunnit: 0,
            kommentti: '',
            ...overrides,
        },
    };
}

describe('Regression tests - buildAkmStats', () => {
    /**
     * Given yearly entries without akm values
     * When akm stats are calculated
     * Then no akm statistics are returned.
     */
    it('given no akm values when building then returns undefined', () => {
        const reenit = [
            makeReeni({ pvm: '2026-01-01' }),
            makeReeni({ pvm: '2026-02-01', akm: 0 }),
        ];

        const result = buildAkmStats(reenit, 2026);

        expect(result).toBeUndefined();
    });
});

describe('New feature tests - buildAkmStats', () => {
    /**
     * Given yearly entries with positive akm and mixed year data
     * When akm stats are calculated for selected year
     * Then sum and average are calculated from selected year positive akm entries only.
     */
    it('given mixed entries when building then calculates yearly akm and keskiakm from positive values', () => {
        const reenit = [
            makeReeni({ pvm: '2026-01-01', akm: 10 }),
            makeReeni({ pvm: '2026-02-01', akm: 20 }),
            makeReeni({ pvm: '2026-03-01', akm: 0 }),
            makeReeni({ pvm: '2025-12-31', akm: 999 }),
        ];

        const result = buildAkmStats(reenit, 2026);

        expect(result).toEqual({
            akm: 30,
            keskiakm: 15,
        });
    });

    /**
     * Given yearly entries with decimal and non-positive akm values
     * When akm stats are calculated
     * Then only positive integers are included in the calculation.
     */
    it('given invalid akm values when building then ignores non-integer and non-positive values', () => {
        const reenit = [
            makeReeni({ pvm: '2026-01-01', akm: 12.5 }),
            makeReeni({ pvm: '2026-02-01', akm: -1 }),
            makeReeni({ pvm: '2026-03-01', akm: 7 }),
        ];

        const result = buildAkmStats(reenit, 2026);

        expect(result).toEqual({
            akm: 7,
            keskiakm: 7,
        });
    });
});
