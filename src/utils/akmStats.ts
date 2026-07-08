export type ReeniForAkmStats = {
    data?: {
        pvm?: string;
        akm?: number;
    };
};

export type AkmStats = {
    akm: number;
    keskiakm: number;
    count: number;
};

// akm sallii yhden desimaalin tarkkuuden (esim. 12.3), ei useampia (esim. 12.34).
export function isValidAkm(value: unknown): value is number {
    return typeof value === 'number'
        && Number.isFinite(value)
        && value > 0
        && Math.round(value * 10) / 10 === value;
}

export function buildAkmStats(reenit: ReeniForAkmStats[], year: number): AkmStats | undefined {
    const yearPrefix = `${year}-`;

    const values = reenit
        .filter((reeni) => reeni?.data?.pvm?.startsWith(yearPrefix))
        .map((reeni) => reeni?.data?.akm)
        .filter(isValidAkm);

    if (values.length === 0) {
        return undefined;
    }

    const akm = Math.round(values.reduce((sum, value) => sum + value, 0) * 10) / 10;
    return {
        akm,
        keskiakm: akm / values.length,
        count: values.length,
    };
}
