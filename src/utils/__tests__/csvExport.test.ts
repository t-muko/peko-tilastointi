import { describe, expect, it } from 'vitest';
import { buildReeniCsv, type ReeniForCsvExport } from '../csvExport';

function makeReeni(overrides: Partial<ReeniForCsvExport['data']> = {}): ReeniForCsvExport {
    return {
        data: {
            pvm: '2026-01-01',
            tunnit: 1,
            kommentti: '',
            kategoria: 'Jälki',
            koira: 'Mvalo',
            ...overrides,
        },
    };
}

describe('buildReeniCsv', () => {
    it('given entries when building then returns header row and one row per entry', () => {
        const reenit = [
            makeReeni({ pvm: '2026-01-05', kategoria: 'Partsa', koira: 'Mörri', tunnit: 2 }),
            makeReeni({ pvm: '2026-01-01', kategoria: 'Jälki', koira: 'Mvalo', tunnit: 1.5 }),
        ];

        const csv = buildReeniCsv(reenit);
        const lines = csv.split('\r\n');

        expect(lines[0]).toBe('Päivämäärä,Kategoria,Koira,Tunnit,Ajokilometrit,Kommentti');
        expect(lines).toHaveLength(3);
    });

    it('given unsorted entries when building then sorts rows chronologically', () => {
        const reenit = [
            makeReeni({ pvm: '2026-03-01' }),
            makeReeni({ pvm: '2026-01-01' }),
            makeReeni({ pvm: '2026-02-01' }),
        ];

        const csv = buildReeniCsv(reenit);
        const dataLines = csv.split('\r\n').slice(1);

        expect(dataLines.map((line) => line.split(',')[0])).toEqual([
            '2026-01-01',
            '2026-02-01',
            '2026-03-01',
        ]);
    });

    it('given an entry with akm when building then includes it as a column', () => {
        const reenit = [makeReeni({ akm: 12.5 })];

        const csv = buildReeniCsv(reenit);
        const [, dataLine] = csv.split('\r\n');

        expect(dataLine).toBe('2026-01-01,Jälki,Mvalo,1,12.5,');
    });

    it('given an entry without akm when building then leaves the column empty', () => {
        const reenit = [makeReeni()];

        const csv = buildReeniCsv(reenit);
        const [, dataLine] = csv.split('\r\n');

        expect(dataLine).toBe('2026-01-01,Jälki,Mvalo,1,,');
    });

    it('given a comment with a comma and quotes when building then quotes and escapes the field', () => {
        const reenit = [makeReeni({ kommentti: 'Hyvä, "loistava" reeni' })];

        const csv = buildReeniCsv(reenit);
        const [, dataLine] = csv.split('\r\n');

        expect(dataLine).toBe('2026-01-01,Jälki,Mvalo,1,,"Hyvä, ""loistava"" reeni"');
    });
});
