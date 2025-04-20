// client/src/context/GameContext.jsx
import { createContext, useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useSocketEvents } from '../utils/socketEvents';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const socket = useSocket();
  const [board, setBoard] = useState(
    Array(15)
      .fill()
      .map(() => Array(15).fill(null))
  );
  const [playerTiles, setPlayerTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [placedTiles, setPlacedTiles] = useState([]);
  const [scores, setScores] = useState({});
  const [currentTurn, setCurrentTurn] = useState(null);

  const placeTile = (row, col, tileIndex, playerId) => {
    if (!playerTiles[tileIndex] || board[row][col]) return;
    const tile = playerTiles[tileIndex];
    socket.emit('placeTile', {
      roomId: window.location.pathname.split('/').pop(),
      row,
      col,
      tile,
      playerId,
    });
  };

  const drawTiles = (count) => {
    socket.emit('drawTiles', {
      roomId: window.location.pathname.split('/').pop(),
      count,
    });
  };

  useSocketEvents(socket, {
    onGameStateUpdate: (newState) => {
      setBoard(newState.board || Array(15).fill().map(() => Array(15).fill(null)));
      setPlayerTiles(newState.playerTiles?.[socket.id] || []);
      setPlacedTiles(newState.placedTiles || []);
      setScores(newState.scores || {});
      setCurrentTurn(newState.currentTurn || null);
    },
    onTilePlaced: ({ row, col, tile }) => {
      const newBoard = [...board];
      newBoard[row][col] = tile;
      setBoard(newBoard);
      setPlacedTiles([...placedTiles, { row, col, tile }]);
      if (playerTiles.some(t => t.letter === tile.letter && t.score === tile.score)) {
        setPlayerTiles(playerTiles.filter(t => t.letter !== tile.letter || t.score !== tile.score));
      }
    },
    onWordSubmitted: ({ word, score }) => {
      alert(`Word submitted: ${word}, Score: ${score}`);
    },
    onError: (message) => {
      alert(message);
    },
  });

  useEffect(() => {
    if (socket) {
      socket.emit('requestGameState', {
        roomId: window.location.pathname.split('/').pop(),
      });
    }
  }, [socket]);

  return (
    <GameContext.Provider
      value={{
        board,
        setBoard,
        playerTiles,
        setPlayerTiles,
        selectedTile,
        setSelectedTile,
        placedTiles,
        placeTile,
        drawTiles,
        scores,
        currentTurn,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};