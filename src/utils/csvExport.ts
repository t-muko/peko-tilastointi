import type { ReeniData } from '../stores/repositories/reeniRepository';

export type ReeniForCsvExport = {
    data: ReeniData;
};

const CSV_HEADER = ['Päivämäärä', 'Kategoria', 'Koira', 'Tunnit', 'Ajokilometrit', 'Kommentti'];

function escapeCsvField(value: string): string {
    if (/[",\r\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * Builds a CSV (Excel-compatible, semicolon-free comma format with UTF-8 BOM
 * expected to be prepended by the caller) of all given reeni entries,
 * sorted chronologically regardless of input order.
 */
export function buildReeniCsv(reenit: ReeniForCsvExport[]): string {
    const rows = reenit
        .slice()
        .sort((a, b) => a.data.pvm.localeCompare(b.data.pvm))
        .map((reeni) => [
            reeni.data.pvm ?? '',
            reeni.data.kategoria ?? '',
            reeni.data.koira ?? '',
            reeni.data.tunnit !== undefined && reeni.data.tunnit !== null ? String(reeni.data.tunnit) : '',
            reeni.data.akm !== undefined && reeni.data.akm !== null ? String(reeni.data.akm) : '',
            reeni.data.kommentti ?? '',
        ].map(escapeCsvField).join(','));

    return [CSV_HEADER.join(','), ...rows].join('\r\n');
}
