/* Methodology:
    - Supply text (can be one word or a lengthy book)
    - Tokenize text into groups of neighboring words (n-grams)
    - Initialize 'hashHits' array with zeros, one element for each possible word-hash value. eg. 8 bit hash yields 256 possible values (2 ** WORD_HASH_BIT_SIZE).
    - Word-Hash each n-gram into {WORD_HASH_BIT_SIZE} bits
    - Increment the corresponding index 'hit counter' in the 'hashHits' array
    - Normalize the hashHits 'counter' values to between 0 (no hits) and 2^HIT_VALUE_BITS-1 (max hits). Eg. 2 bits => max hits gets value of 3.
    - Convert each hashHits hit value to a binary string
    - Concat all binary strings together 
    - Group each 8 bits and convert into a hexadecimal string
    - Compare two hashes by converting back into binary and subtracting hit values from each other (don't do bitwise XOR cuz 10 vs 01 should be diff of 1, not 0)
        The percent match is this difference divided by the 'unioned' area under the two histograms.
*/


class TextPHash {

    static DefaultOptions = {   // These are recommended, but can be changed:
        // Binary size of hash for individual words/grams. Not meant to be unique, just to build a histogram of melded word frequencies.
        WORD_HASH_BIT_SIZE: 6,
        // Binary size of hit counter for a single hash. Actual hits are adjusted to these discrete values. This is the 'y value' in the hash histogram.
        HIT_VALUE_BITS: 4,
        // Number of 'neighbor' words that will be hashed together (1: ABCDE=>[A,B,C,D,E], 2: ABCDE => [AB, BC, CD, DE], 3: ABCDE => [ABC,BCD,CDE])
        NGRAM_WORDS: 2,
        // Non-Unique hash function for each word/ngram.  Select any 'WordHash...' function in this class or provide own that returns a WORD_HASH_BIT_SIZE size hash.
        WORD_HASH_FUNCTION: TextPHash.WordHashDJB
    }


    static computePHash(text, options) {
        options = { ...TextPHash.DefaultOptions, options }
        let hashHits = new Array(2 ** options.WORD_HASH_BIT_SIZE).fill(0); // array of hit counters for each possible hash value

        if (text === null)
            throw new Error('Text is null')
        let words = text
            .toUpperCase()
            .match(/\b[\p{L}\p{Mn}\p{Pd}'’`0-9]+\b|\p{L}/gu) // array of alpha-char words/numbers, individual CJK chars
        if (words !== null && words.length > 0) { // don't do for blank document or contain only non-word items, like images.
            let grams = TextPHash.#nGrams(words, options.NGRAM_WORDS)
            grams.forEach(gram => {
                let wordHash = options.WORD_HASH_FUNCTION(gram, options.WORD_HASH_BIT_SIZE); // hash each n-gram
                hashHits[wordHash]++ // and register a 'hit' for each hash encountered
            });
        }
        // Normalize hit values & convert to hex string
        const NORMALIZED_MAX = 2 ** options.HIT_VALUE_BITS - 1  // the max value that we can save is based on how many bits we have available (= 2 ^ bits)
        let maxHits = hashHits.reduce((a, c) => c > a ? c : a, 0)
        let hash = hashHits
            .map(hits => Math.ceil(NORMALIZED_MAX * hits / maxHits)) // normalize values from 0 to NORMALIZED_MAX
            .reduce((a, c) => a = a + c.toString(2).padStart(options.HIT_VALUE_BITS, '0'), '') // convert to binary
            .match(/.{1,4}/g) // split into 4 bit chunks (because will be one hex digit)
            .map(chunk => parseInt(chunk, 2).toString(16)) // convert each 4-bit chunk to single digit of hex
            .join('')
            .toUpperCase()
        return hash
    }
    static percentMatch(pHashA, pHashB, options) {
        options = { ...TextPHash.DefaultOptions, options }
        if (pHashA.length !== pHashB.length) {
            throw new Error("Strings must be of the same length");
        }
        let aHitsA = TextPHash.#hitArray(pHashA, options)
        let aHitsB = TextPHash.#hitArray(pHashB, options)
        var diff = 0
        var area = 0
        for (let i = 0; i < aHitsA.length; i++) {
            area += Math.max(aHitsA[i], aHitsB[i]) // the 'unioned' area underneath both histograms.
            diff += Math.abs(aHitsA[i] - aHitsB[i])
        }
        let pct = area === 0
            ? 0
            : 100 * ((area - diff) / area)
        return pct;
    }

    //==================================================================================================
    static #nGrams(words, n) {
        let nGrams = []
        if (words.length <= n) {
            nGrams = [words.join(' ')]
        } else {
            for (let i = 0; i < words.length - n + 1; i++) {
                nGrams.push(words.slice(i, i + n).join(' '))
            }
        }
        return nGrams
    }
    static #hitArray(pHash, options) {
        let sBin = pHash.split('').reduce((a, c) => a + Number.parseInt(c, 16).toString(2).padStart(4, '0'), '') // convert each hex digit (which is 4-bits) to binary string
        let aHits = new Array(2 ** options.WORD_HASH_BIT_SIZE).fill(0);
        for (let i = 0; i < (2 ** options.WORD_HASH_BIT_SIZE); i++) {
            let sHits = sBin.slice(i * options.HIT_VALUE_BITS, (i + 1) * options.HIT_VALUE_BITS)
            aHits[i] = parseInt(sHits, 2)
        }
        return aHits
    }

    //==================================================================================================
    //== Possible Word/Phrase Hashes ===================================================================
    //==================================================================================================
    // Only one of these should be used in computePHash(). They are all deterministic and should not be changed once used.
    //   DJBHash is the default because it is the fastest and has been tested to be good enough for this purpose.
    //   FNV1aHash is a good alternative if you want a more robust hash function.
    //   Murmur3Hash is the most robust, but is slower than the other two.

    static WordHashDJB(str, bitSize) {
        const bitmask = (1 << bitSize) - 1;
        let hash = 5381; // Initial hash value (Prime Number, tested  empirically, DJB hash fn std implementation)
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i); // DJB hash function
        }
        return hash & bitmask; // Reduce the hash to 'bitSize' 
    }
    static WordHashFNV1a(str, bitSize) {
        const bitmask = (1 << bitSize) - 1;

        const FNV_OFFSET = new Map([[2, 0x3], [4, 0x7], [8, 0xA3], [16, 0x811C], [32, 0x811C9DC5]])
        const FNV_PRIME = new Map([[2, 0x3], [4, 0x3], [8, 0x13], [16, 0x0101], [32, 0x01000193]])

        if (!FNV_OFFSET.has(bitSize) || !FNV_PRIME.has(bitSize)) {
            throw new Error(`Unsupported bit size: ${bitSize}`);
        }
        let hash = FNV_OFFSET.get(bitSize);
        const fnvPrime = FNV_PRIME.get(bitSize);
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash *= fnvPrime;
            hash &= bitmask;
        }

        return (hash & bitmask);
    }
    static WordHashMurmur3(str, bitSize) {
        const bitmask = (1 << bitSize) - 1;
        const seed = 0x9747b28c
        const c1 = 0xcc9e2d51;
        const c2 = 0x1b873593;
        let h = seed ^ str.length;

        for (let i = 0; i < str.length; i++) {
            let k = str.charCodeAt(i);
            k *= c1;
            k = (k << 15) | (k >>> 17); // Rotate left 15
            k *= c2;

            h ^= k;
            h = (h << 13) | (h >>> 19); // Rotate left 13
            h = h * 5 + 0xe6546b64;
        }

        // Finalization
        h ^= h >>> 16;
        h *= 0x85ebca6b;
        h ^= h >>> 13;
        h *= 0xc2b2ae35;
        h ^= h >>> 16;

        return (h & bitmask);
    }
    //==================================================================================================
}

module.exports = TextPHash  // in order to use in MJS, CJS can only export 'default', can't be {named} variable.

