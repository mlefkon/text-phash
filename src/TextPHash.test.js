const TextPHash = require('./TextPHash')

describe('PHashText', () => {
    test('Do text pHash for similar strings. Percent match should be above 50%.', async () => {
        let hashA = TextPHash.computePHash("The quick brown fox jumped over the black fence.")
        let hashB = TextPHash.computePHash("Over the black fence, the quick brown fox jumped.")
        let pctMatch = TextPHash.percentMatch(hashA, hashB)
        expect(hashA).toBeTruthy()
        expect(pctMatch).toBeGreaterThan(50)
    });
    test('Do text pHash for completely different strings. Percent match should be close to 0% (less than 10%).', async () => {
        let hashA = TextPHash.computePHash("The quick brown fox jumped over the black fence.")
        let hashB = TextPHash.computePHash("My body lies over the ocean, My body lies over the sea.")
        let pctMatch = TextPHash.percentMatch(hashA, hashB)
        expect(hashA).toBeTruthy()
        expect(pctMatch).toBeLessThan(10)
    });
    test('Do text pHash for exactly same strings. Percent match should be exactly 100%.', async () => {
        let hashA = TextPHash.computePHash("The quick brown fox jumped over the black fence.")
        let hashB = TextPHash.computePHash("The quick brown fox jumped over the black fence.")
        let pctMatch = TextPHash.percentMatch(hashA, hashB)
        expect(hashA).toBeTruthy()
        expect(pctMatch).toBe(100)
    });
    test('Do text pHash for similar non-ascii CJK strings. Percent match should be above 50%.', async () => {
        let hashA = TextPHash.computePHash("你的脸上还有微笑吗，人生自古就有许多愁和苦，请你多一些开心 少一些烦恼，你的所得还那样少吗，你的付出还那样多吗，生活的路总有一些不平事，请你不必太在意，洒脱一些过得好，祝你平安 噢 祝你平安，让那快乐围绕在你身边")
        let hashB = TextPHash.computePHash("他的脸上还有微笑吗，人生自古就有许多愁和苦，请他多一些开心 少一些烦恼，他的所得还那样少吗，他的付出还那样多吗，生活的路总有一些不平事，请他不必太在意，洒脱一些过得好，祝他平安 噢 祝他平安，让那快乐围绕在他身边")
        let pctMatch = TextPHash.percentMatch(hashA, hashB)
        expect(hashA).toBeTruthy()
        expect(pctMatch).toBeGreaterThan(50)
    });
    test('Do text pHash for one empty string, one non-empty. Percent match should be exactly 0%.', async () => {
        let hashA = TextPHash.computePHash("The quick brown fox jumped over the black fence.")
        let hashB = TextPHash.computePHash("")
        let pctMatch = TextPHash.percentMatch(hashA, hashB)
        expect(hashA).toBeTruthy()
        expect(pctMatch).toBe(0)
    });
    test("Do text pHash for two empty strings. Percent match should be exactly 0%.", async () => {
        let hashA = TextPHash.computePHash("")
        let hashB = TextPHash.computePHash("")
        let pctMatch = TextPHash.percentMatch(hashA, hashB)
        expect(hashA).toBeTruthy()
        expect(pctMatch).toBe(0)
    });
    test("Do text pHash for two identical one word strings where NGRAM_WORDS >= 2. Percent match should be 100%.", async () => {
        let hashA = TextPHash.computePHash("cat", { NGRAM_WORDS: 3 })
        let hashB = TextPHash.computePHash("cat", { NGRAM_WORDS: 3 })
        let pctMatch = TextPHash.percentMatch(hashA, hashB)
        expect(hashA).toBeTruthy()
        expect(pctMatch).toBe(100)
    });
    test("Do text pHash for two different one word strings where NGRAM_WORDS >= 2. Percent match should be 100%.", async () => {
        let hashA = TextPHash.computePHash("dog", { NGRAM_WORDS: 3 })
        let hashB = TextPHash.computePHash("cat", { NGRAM_WORDS: 3 })
        let pctMatch = TextPHash.percentMatch(hashA, hashB)
        expect(hashA).toBeTruthy()
        expect(pctMatch).toBe(0)
    });
    test("Empty String should result in hash of all '0's using the default DJB Hash.", async () => {
        let hashA = TextPHash.computePHash("", { WORD_HASH_FUNCTION: TextPHash.WordHashDJB })
        expect(hashA).toBeTruthy()
        expect(hashA).toMatch(/^0+$/);
    });
    test("Empty String should result in hash of all '0's using FNV1a Hash.", async () => {
        let hashA = TextPHash.computePHash("", { WORD_HASH_FUNCTION: TextPHash.WordHashFNV1a })
        expect(hashA).toBeTruthy()
        expect(hashA).toMatch(/^0+$/);
    });
    test("Empty String should result in hash of all '0's using Murmur3 Hash.", async () => {
        let hashA = TextPHash.computePHash("", { WORD_HASH_FUNCTION: TextPHash.WordHashMurmur3 })
        expect(hashA).toBeTruthy()
        expect(hashA).toMatch(/^0+$/);
    });
    test("NULL String should result in error 'Text is null'.", async () => {
        expect(() => {
            let hashA = TextPHash.computePHash(null)
        }).toThrow('Text is null');
    });
});