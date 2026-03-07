import { describe, it, expect } from 'vitest';
import { parseHashtags } from '../hashtag';

describe('Regression tests - parseHashtags', () => {
    /**
     * Given empty input text
     * When hashtags are parsed
     * Then an empty list is returned.
     */
    it('given empty text when parsing then returns empty array', () => {
        const result = parseHashtags('');

        expect(result).toEqual([]);
    });
});

describe('New feature tests - parseHashtags', () => {
    /**
     * Given comment text with repeated and mixed-case hashtags
     * When hashtags are parsed
     * Then tags are lowercased and duplicates are removed in encounter order.
     */
    it('given mixed case and duplicate hashtags when parsing then normalizes and deduplicates', () => {
        const result = parseHashtags('Tehtiin #MyOwn #myown #LAVIINI #laviini');

        expect(result).toEqual(['myown', 'laviini']);
    });

    /**
     * Given text containing a URL with hash fragment and one real hashtag
     * When hashtags are parsed
     * Then URL fragment is ignored and only the real hashtag is returned.
     */
    it('given url fragment and real hashtag when parsing then ignores url fragment', () => {
        const result = parseHashtags('Katso https://example.com/#fragment ja treeni #haku');

        expect(result).toEqual(['haku']);
    });

    /**
     * Given text with Finnish letters in hashtags
     * When hashtags are parsed
     * Then tags with Finnish letters are recognized and lowercased.
     */
    it('given finnish letters when parsing then supports scandinavian characters', () => {
        const result = parseHashtags('Treeni #ÄLY #ÖLJY #saanto #Åke');

        expect(result).toEqual(['äly', 'öljy', 'saanto', 'åke']);
    });

    /**
     * Given text with malformed hashtag candidates
     * When hashtags are parsed
     * Then empty hashtag marker is ignored and valid tags are extracted.
     */
    it('given malformed and valid tags when parsing then keeps only valid tags', () => {
        const result = parseHashtags('Virhe # ja validi #koe #toinen-tagi');

        expect(result).toEqual(['koe', 'toinen-tagi']);
    });
});
