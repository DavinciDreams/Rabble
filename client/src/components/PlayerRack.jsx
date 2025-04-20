// components/PlayerRack.jsx
import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import Tile from './Tile';

const PlayerRack = () => {
  const { playerTiles, selectedTile, setSelectedTile } = useContext(GameContext);

  const handleSelectTile = (index) => {
    setSelectedTile(index === selectedTile ? null : index);
  };

  return (
    <div className="flex justify-center gap-2.5 mt-5 max-w-[600px] flex-wrap mx-auto">
      {playerTiles.map((tile, index) => (
        <Tile
          key={index}
          letter={tile.letter}
          score={tile.score}
          isSelected={selectedTile === index}
          onClick={() => handleSelectTile(index)}
          isPlaced={false}
        />
      ))}
    </div>
  );
};

export default PlayerRack;