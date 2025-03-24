# TextPHash
### Perceptual Hash for text strings.

Source repository [Github: mlefkon/XXXXXXX](https://github.com/mlefkon/XXXXXXX)

---

## What it does

- Computes perceptual hashes for a text string.
- Compares perceptual hashes to give a percent similarity between two different text strings.

## Usage

**Node (CJS)**

    const TextPHash = require('./TextPHash.js')


**Browser (ES)**

    import TextPHash from './TextPHash.js'

## Methodology
1.  Supply text (can be one word or a lengthy book)
2.  Tokenize text into groups of NGRAM_WORDS neighboring words (n-grams). 
3.  Initialize `[hashHits]` array with (2 ^ WORD_HASH_BIT_SIZE) zeros, one 'counter' for each possible hash value. 
4.  Use {WORD_HASH_FUNCTION} to hash each n-gram into {WORD_HASH_BIT_SIZE} bits.
5.  Increment that hash's 'counter' in the `[hashHits]` array
6.  Normalize the `[hashHits]` counters to between 0 (no hits) and 2^HIT_VALUE_BITS-1 (max hits).
7.  Convert `[hashHits]` array into a hexadecimal string
8.  Compare two hashes by converting hex back into binary array and comparing the difference in hits.

## Default Options

These are available on the static class variable TextPHash.DefaultOptions:

- NGRAM_WORDS: default = 2
    
    Number of 'neighbor' words that will be together hashed (1: ABCDE=>[A,B,C,D,E], 2: ABCDE => [AB, BC, CD, DE], 3: ABCDE => [ABC,BCD,CDE])

- WORD_HASH_FUNCTION: default = TextPHash.WordHashDJB

    The Non-Unique hash function done on each word/ngram.  Select any 'WordHash...' function in TextPHash class (DJB, FNV1a, Murmur3) or provide your own that returns a WORD_HASH_BIT_SIZE size hash.

- WORD_HASH_BIT_SIZE: default = 6

    The binary size of hash produced by WORD_HASH_FUNCTION, done on each word/ngram. Not meant to be unique, just to build a histogram of melded word frequencies. This is the 'x value' in the hash histogram. So if this is '6', there will be 2^6, or 64 possible 'x values'.

- HIT_VALUE_BITS: default = 4

    Binary size of hit counter for a single hash. Actual hits are adjusted to these discrete values.  So if this is '4' and hash hits range from 0 to a max of 155, the 155 value will be adjusted to 2^4-1, or a max value of 15.  Lower values will be correspondingly adjusted. This is the 'y value' in the hash histogram.


