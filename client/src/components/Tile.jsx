// components/Tile.jsx
import React from 'react';

const Tile = ({ letter, score, isSelected, onClick, isPlaced }) => {
  return (
    <div
      className={`
        relative w-10 h-10 flex items-center justify-center text-lg font-bold
        ${isPlaced ? 'bg-scrabble-beige' : 'bg-scrabble-beige border-2 border-scrabble-brown'}
        rounded-sm cursor-pointer transition-transform duration-200
        ${isSelected ? 'border-yellow-400 scale-110' : 'hover:scale-110'}
      `}
      onClick={onClick}
    >
      <span className="tile-letter">{letter === '*' ? ' ' : letter}</span>
      <span className="tile-score text-[0.7em] text-gray-600 absolute bottom-[2px] right-[2px]">
        {score}
      </span>
    </div>
  );
};

export default Tile;
