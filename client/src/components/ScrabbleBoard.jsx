import React, { useEffect, useState } from 'react';

const boardSize = 15;

const ScrabbleBoard = ({ onPlaceTile, board, placedTiles }) => {
  const getSpecialTile = (row, col) => {
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

    if (tripleWord.some(pos => pos[0] === row && pos[1] === col)) return { class: 'triple-word', text: 'TW' };
    if (doubleWord.some(pos => pos[0] === row && pos[1] === col)) return { class: 'double-word', text: 'DW' };
    if (tripleLetter.some(pos => pos[0] === row && pos[1] === col)) return { class: 'triple-letter', text: 'TL' };
    if (doubleLetter.some(pos => pos[0] === row && pos[1] === col)) return { class: 'double-letter', text: 'DL' };
    return null;
  };

  return (
    <div className="scrabble-board">
      {Array(boardSize).fill().map((_, row) => (
        Array(boardSize).fill().map((_, col) => {
          const tile = getSpecialTile(row, col);
          const placedTile = board[row]?.[col];
          return (
            <div
              key={`${row}-${col}`}
              className={`tile ${tile?.class || ''} ${placedTile ? 'placed' : ''}`}
              onClick={() => onPlaceTile(row, col)}
            >
              {placedTile ? (
                <>
                  <span className="tile-letter">{placedTile.letter}</span>
                  <span className="tile-score">{placedTile.score}</span>
                </>
              ) : (
                tile?.text || ''
              )}
            </div>
          );
        })
      ))}
    </div>
  );
};

export default ScrabbleBoard;
