// components/GameControls.jsx
import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { useSocket } from '../hooks/useSocket';
import { getSpecialTile } from '../../../server/src/utils/constants';

const GameControls = () => {
  const { playerTiles, placedTiles, board, drawTiles, currentTurn } = useContext(GameContext);
  const socket = useSocket();
  const isMyTurn = currentTurn === socket?.id;

  const handleResetBoard = () => {
    if (!isMyTurn) {
      alert('Not your turn!');
      return;
    }
    socket.emit('resetBoard', {
      roomId: window.location.pathname.split('/').pop(),
    });
  };

  const handleShuffleTiles = () => {
    if (!isMyTurn) {
      alert('Not your turn!');
      return;
    }
    socket.emit('shuffleTiles', {
      roomId: window.location.pathname.split('/').pop(),
    });
  };

  const handleSubmitWord = async () => {
    if (!isMyTurn) {
      alert('Not your turn!');
      return;
    }
    if (placedTiles.length === 0) {
      alert('Place some tiles first!');
      return;
    }
    const isFirstMove = board.flat().every(cell => cell === null);
    if (isFirstMove && !placedTiles.some(t => t.row === 7 && t.col === 7)) {
      alert('First move must include the center star!');
      return;
    }
    if (!isFirstMove) {
      const connected = placedTiles.some(({ row, col }) => {
        return (
          (row > 0 && board[row - 1][col]) ||
          (row < 14 && board[row + 1][col]) ||
          (col > 0 && board[row][col - 1]) ||
          (col < 14 && board[row][col + 1])
        );
      });
      if (!connected) {
        alert('Tiles must connect to existing words!');
        return;
      }
    }
    const word = getWordFromTiles();
    if (!word) {
      alert('Tiles must form a horizontal or vertical word!');
      return;
    }
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      if (response.ok) {
        const score = calculateScore();
        socket.emit('submitWord', {
          roomId: window.location.pathname.split('/').pop(),
          word,
          score,
        });
        drawTiles(7 - playerTiles.length);
      } else {
        socket.emit('error', 'Invalid word!');
      }
    } catch (error) {
      socket.emit('error', 'Error validating word.');
    }
  };

  const getWordFromTiles = () => {
    const sortedTiles = [...placedTiles].sort((a, b) => (a.row === b.row ? a.col - b.col : a.row - b.row));
    const isHorizontal = placedTiles.every(t => t.row === placedTiles[0].row);
    const isVertical = placedTiles.every(t => t.col === placedTiles[0].col);
    if (isHorizontal) {
      const row = placedTiles[0].row;
      const cols = sortedTiles.map(t => t.col);
      return cols.map(col => board[row][col].letter).join('');
    } else if (isVertical) {
      const col = placedTiles[0].col;
      const rows = sortedTiles.map(t => t.row);
      return rows.map(row => board[row][col].letter).join('');
    }
    return null;
  };

  const calculateScore = () => {
    let score = 0;
    let wordMultiplier = 1;
    for (const { row, col, tile } of placedTiles) {
      let tileScore = tile.score;
      const special = getSpecialTile(row, col);
      if (special) {
        if (special.class.includes('double-letter')) tileScore *= 2;
        if (special.class.includes('triple-letter')) tileScore *= 3;
        if (special.class.includes('double-word') || (row === 7 && col === 7)) wordMultiplier *= 2;
        if (special.class.includes('triple-word')) wordMultiplier *= 3;
      }
      score += tileScore;
    }
    return score * wordMultiplier;
  };

  return (
    <div className="flex gap-4 justify-center mt-5 flex-wrap">
      <button
        className={`px-5 py-2.5 text-white rounded-md transition-colors duration-200 ${
          isMyTurn ? 'bg-scrabble-brown hover:bg-scrabble-brown-dark' : 'bg-gray-400 cursor-not-allowed'
        }`}
        onClick={handleResetBoard}
        disabled={!isMyTurn}
      >
        Reset Board
      </button>
      <button
        className={`px-5 py-2.5 text-white rounded-md transition-colors duration-200 ${
          isMyTurn ? 'bg-scrabble-brown hover:bg-scrabble-brown-dark' : 'bg-gray-400 cursor-not-allowed'
        }`}
        onClick={handleShuffleTiles}
        disabled={!isMyTurn}
      >
        Shuffle Tiles
      </button>
      <button
        className={`px-5 py-2.5 text-white rounded-md transition-colors duration-200 ${
          isMyTurn ? 'bg-scrabble-brown hover:bg-scrabble-brown-dark' : 'bg-gray-400 cursor-not-allowed'
        }`}
        onClick={handleSubmitWord}
        disabled={!isMyTurn}
      >
        Submit Word
      </button>
    </div>
  );
};

export default GameControls;