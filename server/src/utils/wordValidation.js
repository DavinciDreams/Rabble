const https = require('https');
const offlineDictionary = require('./offlineDictionary');

class WordValidator {
  constructor() {
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
    this.requestsInLastMinute = 0;
    this.lastRequestTime = Date.now();
  }
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    this.isProcessing = true;

    const now = Date.now();
    if (now - this.lastRequestTime >= 60000) {
      this.requestsInLastMinute = 0;
      this.lastRequestTime = now;
    }

    while (this.requestQueue.length > 0 && this.requestsInLastMinute < 10) {
      const { word, resolve } = this.requestQueue.shift();
      await this.validateWordWithAPI(word, resolve);
      this.requestsInLastMinute++;
      this.lastRequestTime = Date.now();
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
    if (this.requestQueue.length > 0) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  async validateWordWithAPI(word, resolve) {
    const options = {
      hostname: 'www.dictionaryapi.com',
      path: `/api/v3/references/collegiate/json/${word}?key=${process.env.DICTIONARY_API_KEY || ''}`,
      method: 'GET'
    };

    return new Promise((innerResolve) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            const isValid = Array.isArray(result) && result.length > 0 && typeof result[0] === 'object';
            this.cache.set(word, isValid);
            resolve(isValid);
            innerResolve();
          } catch (e) {
            console.error('Word validation error:', e);
            resolve(false);
            innerResolve();
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('Dictionary API error:', error);
        resolve(false);
        innerResolve();
      });
      
      req.end();
    });
  }
  async isValidWord(word) {
    word = word.toLowerCase();
    
    // Check cache first
    if (this.cache.has(word)) {
      return this.cache.get(word);
    }

    // Check offline dictionary first as a quick validation
    if (offlineDictionary.isValidWord(word)) {
      this.cache.set(word, true);
      return true;
    }

    // Only use API for words not in offline dictionary
    if (process.env.DICTIONARY_API_KEY) {
      return new Promise(resolve => {
        this.requestQueue.push({ word, resolve });
        this.processQueue();
      });
    }

    // If no API key, rely solely on offline dictionary
    return false;
  }

  // Validate all words in parallel
  async validateWords(words) {
    const promises = words.map(word => this.isValidWord(word));
    return Promise.all(promises);
  }
}

module.exports = new WordValidator();
