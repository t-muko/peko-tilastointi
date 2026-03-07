const URL_REGEX = /\bhttps?:\/\/[^\s]+/giu;
// Tag body: 1-30 chars, hyphen allowed only in the middle (not as last char).
const HASHTAG_REGEX = /(^|[^\p{L}\p{N}_-])#([\p{L}\p{N}](?:[\p{L}\p{N}-]{0,28}[\p{L}\p{N}])?)(?![\p{L}\p{N}-])/gu;

/**
 * Parses hashtags from free-form comment text.
 *
 * Rules:
 * - accepts letters, numbers and hyphens after `#`
 * - lowercases tags using Finnish locale
 * - ignores URL fragments by removing URLs before matching
 * - returns each hashtag at most once in encounter order
 */
export function parseHashtags(text: string): string[] {
    if (!text) {
        return [];
    }

    const textWithoutUrls = text.replace(URL_REGEX, ' ');
    const uniqueTags = new Set<string>();

    for (const match of textWithoutUrls.matchAll(HASHTAG_REGEX)) {
        uniqueTags.add(match[2].toLocaleLowerCase('fi-FI'));
    }

    return Array.from(uniqueTags);
}
