// components/ScrabbleBoard.jsx
import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { getSpecialTile } from '../../../server/src/utils/constants';
import Tile from './Tile';
import { useSocket } from '../hooks/useSocket';

const boardSize = 15;

const ScrabbleBoard = () => {
  const { board, selectedTile, placeTile, playerTiles, currentTurn } = useContext(GameContext);
  const socket = useSocket();
  const isMyTurn = currentTurn === socket?.id;

  const handlePlaceTile = (row, col) => {
    if (!isMyTurn) {
      alert('Not your turn!');
      return;
    }
    if (selectedTile !== null && playerTiles[selectedTile]) {
      placeTile(row, col, selectedTile, socket.id);
    }
  };

  return (
    <div className="scrabble-board grid grid-cols-15 gap-[2px] bg-scrabble-brown max-w-[600px] aspect-square mx-auto">
      {Array(boardSize)
        .fill()
        .map((_, row) =>
          Array(boardSize)
            .fill()
            .map((_, col) => {
              const tile = getSpecialTile(row, col);
              const placedTile = board[row]?.[col];
              return (
                <div
                  key={`${row}-${col}`}
                  className={`tile flex items-center justify-center text-sm font-bold ${
                    tile?.class || ''
                  } ${placedTile ? 'placed' : ''}`}
                  onClick={() => handlePlaceTile(row, col)}
                >
                  {placedTile ? (
                    <Tile
                      letter={placedTile.letter}
                      score={placedTile.score}
                      isSelected={false}
                      isPlaced={true}
                    />
                  ) : (
                    tile?.text || (row === 7 && col === 7 ? '★' : '')
                  )}
                </div>
              );
            })
        )}
    </div>
  );
};

export default ScrabbleBoard;