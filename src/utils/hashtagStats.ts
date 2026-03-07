import { parseHashtags } from './hashtag';

export type HashtagStat = {
    H: number;
    X: number;
};

export type HashtagStats = Record<string, HashtagStat>;

export type ReeniForHashtagStats = {
    data?: {
        pvm?: string;
        kommentti?: string;
        tunnit?: number | string | null;
    };
};

/**
 * Extracts a 4-digit year from a date string.
 */
function parseYear(pvm?: string): number | null {
    if (!pvm) {
        return null;
    }

    const yearMatch = pvm.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? Number(yearMatch[0]) : null;
}

/**
 * Coerces optional hour values to a finite number.
 */
function parseHours(tunnit?: number | string | null): number {
    const numericValue = Number(tunnit ?? 0);
    return Number.isFinite(numericValue) ? numericValue : 0;
}

/**
 * Builds local hashtag statistics for the selected year.
 *
 * `X` counts how many entries contain the hashtag and `H` sums entry hours.
 */
export function buildHashtagStats(reenit: ReeniForHashtagStats[], year: number): HashtagStats {
    const stats: HashtagStats = {};

    for (const reeni of reenit) {
        const data = reeni.data ?? {};
        if (parseYear(data.pvm) !== year) {
            continue;
        }

        const hashtags = parseHashtags(data.kommentti ?? '');
        const hours = parseHours(data.tunnit);

        for (const tag of hashtags) {
            if (!stats[tag]) {
                stats[tag] = { H: 0, X: 0 };
            }

            stats[tag].X += 1;
            stats[tag].H += hours;
        }
    }

    return stats;
}
