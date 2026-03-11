export type ReeniForAkmStats = {
    data?: {
        pvm?: string;
        akm?: number;
    };
};

export type AkmStats = {
    akm: number;
    keskiakm: number;
};

export function buildAkmStats(reenit: ReeniForAkmStats[], year: number): AkmStats | undefined {
    const yearPrefix = `${year}-`;

    const values = reenit
        .filter((reeni) => reeni?.data?.pvm?.startsWith(yearPrefix))
        .map((reeni) => reeni?.data?.akm)
        .filter((akm): akm is number => Number.isInteger(akm) && (akm as number) > 0);

    if (values.length === 0) {
        return undefined;
    }

    const akm = values.reduce((sum, value) => sum + value, 0);
    return {
        akm,
        keskiakm: akm / values.length,
    };
}
