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
2.  Tokenize text into neighboring word-groups. Number of words in each group is set in options:NGRAM_WORDS. 
3.  Initialize a `[hashHits]` array with zeros, one 'counter' for each possible hash value. Number of hash values is set in options:WORD_HASH_BITS.
4.  Hash each word-group.
5.  For each hash encountered, increment it's 'counter' in the `[hashHits]` array
6.  Normalize all `[hashHits]` counters between 0, for no hits, and a set maximum (set in options:HIT_VALUE_BITS) hits.
7.  Convert `[hashHits]` array into a hexadecimal string.
8.  Compare two hashes by converting hex back into `[hashHits]` array and comparing the difference in hits.

## Functions

For optional `options` parameter {object}, supply one or more properties from the 'Default Options' object below.

### computePHash()

```javascript
TextPHash.computePHash(text)
TextPHash.computePHash(text, options)
```

- Returns a hexadecimal number representing a binary string (`2 ^ WORD_HASH_BITS` x `2 ^ HIT_VALUE_BITS`) bits long. Using the default options, this will be a 64 digit hexadecimal string.

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
    
    Number of 'neighbor' words that will be hashed together.
    
    For example, a value of 1: ABCDE=>[A,B,C,D,E], 2: ABCDE => [AB, BC, CD, DE], 3: ABCDE => [ABC,BCD,CDE]

- `WORD_HASH_FUNCTION`: default = TextPHash.WordHashDJB

    A function that does a non-unique hash on each word-group/ngram.
    
    Select any `TextPHash.WordHash...` function in TextPHash class (DJB, FNV1a, Murmur3).  Or provide your own with signature: `(strText, intHashBitSize) => intHash`

- `WORD_HASH_BITS`: default = 6

    The binary size of hash produced by WORD_HASH_FUNCTION. 
    
    Hashes are not meant to be unique, so this can be a low number.  The hashes build a histogram of melded word frequencies.  This is the 'x value' in the word-group-hash histogram.  So if this is '6', there will be 2^6 possible hashes, or 64 'x values'. 

- `HIT_VALUE_BITS`: default = 4

    Binary size of hit counter for a single hash. Actual hits are adjusted down to these discrete values.  
    
    So if this is '4' and hash counters range from 0 to a max of 140 hits, the 140 value will be adjusted to (2^4)-1, or a max value of 15.  A hash counter with lower value, say 70 hits, would get an adjusted value of 8.  This is the 'y value' in the word-group-hash histogram.


