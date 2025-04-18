const commonWords = require('./commonWords');

class OfflineDictionary {
  constructor() {
    this.wordSet = new Set(commonWords);
  }

  isValidWord(word) {
    return this.wordSet.has(word.toLowerCase());
  }
}

module.exports = new OfflineDictionary();
