const tileBag = [
  { letter: 'A', score: 1, count: 9 }, { letter: 'B', score: 3, count: 2 },
  { letter: 'C', score: 3, count: 2 }, { letter: 'D', score: 2, count: 4 },
  { letter: 'E', score: 1, count: 12 }, { letter: 'F', score: 4, count: 2 },
  { letter: 'G', score: 2, count: 3 }, { letter: 'H', score: 4, count: 2 },
  { letter: 'I', score: 1, count: 9 }, { letter: 'J', score: 8, count: 1 },
  { letter: 'K', score: 5, count: 1 }, { letter: 'L', score: 1, count: 4 },
  { letter: 'M', score: 3, count: 2 }, { letter: 'N', score: 1, count: 6 },
  { letter: 'O', score: 1, count: 8 }, { letter: 'P', score: 3, count: 2 },
  { letter: 'Q', score: 10, count: 1 }, { letter: 'R', score: 1, count: 6 },
  { letter: 'S', score: 1, count: 4 }, { letter: 'T', score: 1, count: 6 },
  { letter: 'U', score: 1, count: 4 }, { letter: 'V', score: 4, count: 2 },
  { letter: 'W', score: 4, count: 2 }, { letter: 'X', score: 8, count: 1 },
  { letter: 'Y', score: 4, count: 2 }, { letter: 'Z', score: 10, count: 1 },
  { letter: '*', score: 0, count: 2 }
];

class ScrabbleGame {
  constructor() {
    this.board = Array(15).fill().map(() => Array(15).fill(null));
    this.tileBag = this.initializeTileBag();
    this.players = new Map(); // playerId -> {tiles: [], score: 0}
    this.currentTurn = null;
    this.turnOrder = [];
    this.lastMove = null;
  }

  initializeTileBag() {
    const bag = [];
    tileBag.forEach(({ letter, score, count }) => {
      for (let i = 0; i < count; i++) {
        bag.push({ letter, score });
      }
    });
    return this.shuffleArray(bag);
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  addPlayer(playerId) {
    if (!this.players.has(playerId)) {
      this.players.set(playerId, {
        tiles: this.drawTiles(7),
        score: 0
      });
      this.turnOrder.push(playerId);
      if (!this.currentTurn) this.currentTurn = playerId;
    }
    return this.players.get(playerId).tiles;
  }

  drawTiles(count) {
    const tiles = [];
    for (let i = 0; i < count && this.tileBag.length > 0; i++) {
      tiles.push(this.tileBag.pop());
    }
    return tiles;
  }
  async isValidMove(playerId, placements) {
    if (playerId !== this.currentTurn) return false;
    
    // Check if tiles are connected
    if (!this.areTilesConnected(placements)) return false;
    
    // Check if words formed are valid
    const words = this.getFormedWords(placements);
    const validationResults = await Promise.all(words.map(word => this.isValidWord(word)));
    return validationResults.every(isValid => isValid);
  }

  areTilesConnected(placements) {
    if (placements.length === 0) return false;
    if (placements.length === 1) return true;

    // Check if tiles are in same row or column
    const rows = new Set(placements.map(p => p.row));
    const cols = new Set(placements.map(p => p.col));
    
    return rows.size === 1 || cols.size === 1;
  }

  getFormedWords(placements) {
    // This is a simplified version - in a real game, we'd need to:
    // 1. Check horizontal and vertical words formed
    // 2. Include existing tiles on the board that are part of new words
    // 3. Validate against a dictionary
    return placements.map(p => p.tile.letter).join('');
  }
  async isValidWord(word) {
    const wordValidator = require('./wordValidation');
    return await wordValidator.isValidWord(word);
  }

  calculateScore(placements) {
    let score = 0;
    let wordMultiplier = 1;

    placements.forEach(({ row, col, tile }) => {
      let letterScore = tile.score;
      const specialTile = this.getSpecialTile(row, col);
      
      if (specialTile) {
        if (specialTile === 'DL') letterScore *= 2;
        if (specialTile === 'TL') letterScore *= 3;
        if (specialTile === 'DW') wordMultiplier *= 2;
        if (specialTile === 'TW') wordMultiplier *= 3;
      }
      
      score += letterScore;
    });

    return score * wordMultiplier;
  }

  getSpecialTile(row, col) {
    const tripleWord = [
      [0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]
    ];
    const doubleWord = [
      [1, 1], [2, 2], [3, 3], [4, 4], [1, 13], [2, 12], [3, 11], [4, 10],
      [10, 4], [11, 3], [12, 2], [13, 1], [10, 10], [11, 11], [12, 12], [13, 13]
    ];
    const tripleLetter = [
      [1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]
    ];
    const doubleLetter = [
      [0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14], [6, 2], [6, 6], [6, 8], [6, 12],
      [7, 3], [7, 11], [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14], [12, 6], [12, 8], [14, 3], [14, 11]
    ];

    if (tripleWord.some(([r, c]) => r === row && c === col)) return 'TW';
    if (doubleWord.some(([r, c]) => r === row && c === col)) return 'DW';
    if (tripleLetter.some(([r, c]) => r === row && c === col)) return 'TL';
    if (doubleLetter.some(([r, c]) => r === row && c === col)) return 'DL';
    return null;
  }
  async makeMove(playerId, placements) {
    if (!await this.isValidMove(playerId, placements)) return false;

    // Apply placements to board
    placements.forEach(({ row, col, tile }) => {
      this.board[row][col] = tile;
    });

    // Calculate and update score
    const score = this.calculateScore(placements);
    const playerState = this.players.get(playerId);
    playerState.score += score;

    // Draw new tiles
    const newTiles = this.drawTiles(placements.length);
    playerState.tiles = playerState.tiles
      .filter(t => !placements.some(p => p.tile === t))
      .concat(newTiles);

    // Update turn
    this.lastMove = { playerId, placements, score };
    this.nextTurn();

    return true;
  }

  nextTurn() {
    const currentIndex = this.turnOrder.indexOf(this.currentTurn);
    this.currentTurn = this.turnOrder[(currentIndex + 1) % this.turnOrder.length];
  }

  getGameState() {
    return {
      board: this.board,
      players: Array.from(this.players.entries()).map(([id, state]) => ({
        id,
        score: state.score,
        tileCount: state.tiles.length
      })),
      currentTurn: this.currentTurn,
      lastMove: this.lastMove,
      remainingTiles: this.tileBag.length
    };
  }

  getPlayerTiles(playerId) {
    return this.players.get(playerId)?.tiles || [];
  }
}

module.exports = { ScrabbleGame };
