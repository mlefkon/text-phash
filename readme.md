# TextPHash
### Perceptual Hash for text strings.
- Source repository: [Github: mlefkon/text-phash](https://github.com/mlefkon/text-phash)
- NPM Package: [NPM: text-phash](https://www.npmjs.com/package/text-phash)

---

## What it does

- Computes a perceptual hash for a text string.
- Compares perceptual hashes to give a percent similarity between two text strings.

## Usage

    const TextPHash = require('text-phash')
    // OR
    import TextPHash from 'text-phash'

    let hashA = TextPHash.computePHash("The quick brown fox jumped over the black fence.")
    let hashB = TextPHash.computePHash("Over the black fence, the quick brown fox jumped.")
    let pctMatch = TextPHash.percentMatch(hashA, hashB)
    console.log(hashA) // 00500000000000000000000500000000000F0050005000000000000000500000
    console.log(hashB) // 00500005000000000000000500000000000F0000005000000000000000500000
    console.log(pctMatch);  // 77.77777777777779

## Methodology
1.  Supply text (can be one word or a lengthy book)
2.  Tokenize text into neighboring groups of words. Each group is NGRAM_WORDS long. 
3.  Initialize `[hashHits]` array with zeros, one 'counter' for each possible hash value. Array length is determined by WORD_HASH_BIT_SIZE.
4.  Hash each word-group.
5.  For each hash encountered, increment it's 'counter' in the `[hashHits]` array
6.  Normalize all `[hashHits]` counters between 0, for no hits, and max hits (determined by HIT_VALUE_BITS).
7.  Convert `[hashHits]` array into a hexadecimal string.
8.  Compare two hashes by converting hex back into `[hashHits]` array and comparing the difference in hits.

## Functions

For optional `options` parameter {object}, supply one or more possible properties from the 'Default Options' object below.

### computePHash()

```javascript
TextPHash.computePHash(text)
TextPHash.computePHash(text, options)
```

- Returns a hexadecimal number representing a binary string (`2 ^ WORD_HASH_BIT_SIZE` x `2 ^ HIT_VALUE_BITS`) bits long. Using the default options, this will be a 64 digit hexadecimal string.

### percentMatch()

```javascript
TextPHash.percentMatch(pHashA, pHashB)
TextPHash.percentMatch(pHashA, pHashB, options)
```

- If options are supplied, they must be the same as those used to create the hashes.
- Returns a number between zero and 100.  

## Default Options

Available on the static class object `TextPHash.DefaultOptions`:

- `NGRAM_WORDS`: default = 2
    
    Number of 'neighbor' words that will be together hashed (1: ABCDE=>[A,B,C,D,E], 2: ABCDE => [AB, BC, CD, DE], 3: ABCDE => [ABC,BCD,CDE])

- `WORD_HASH_FUNCTION`: default = TextPHash.WordHashDJB

    The Non-Unique hash function done on each group of words/ngram.  Select any `TextPHash.WordHash...` function in TextPHash class (DJB, FNV1a, Murmur3).  Or provide your own with signature: `(str, bitSize) => numHash` which is a `bitSize` sized hash.

- `WORD_HASH_BIT_SIZE`: default = 6

    The binary size of hash produced by WORD_HASH_FUNCTION. Not meant to be unique, just to build a histogram of melded word frequencies. So if this is '6', there will be 2^6, or 64 possible 'x values' that a word hash could end up being. This is the 'x value' in the hash histogram.

- `HIT_VALUE_BITS`: default = 4

    Binary size of hit counter for a single hash. Actual hits are adjusted to these discrete values.  So if this is '4' and hash hits range from 0 to a max of 155, the 155 value will be adjusted to 2^4-1, or a max value of 15.  Lower values will be correspondingly adjusted. This is the 'y value' in the hash histogram.


