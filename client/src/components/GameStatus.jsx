// components/GameStatus.jsx
import { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';
import { useSocket } from '../hooks/useSocket';
import { useSocketEvents } from '../utils/socketEvents';

const GameStatus = () => {
  const { playerTiles } = useContext(GameContext);
  const socket = useSocket();
  const [scores, setScores] = useState({});
  const [currentTurn, setCurrentTurn] = useState(null);
  const [tileBagCount, setTileBagCount] = useState(100); // Initial count, adjust based on tileBag

  useSocketEvents(socket, {
    onGameStateUpdate: (newState) => {
      setScores(newState.scores || {});
      setCurrentTurn(newState.currentTurn || null);
      setTileBagCount(newState.tileBag?.length || 0);
    },
    onWordSubmitted: ({ word, score }) => {
      // Optional: Display recent word
      console.log(`Word submitted: ${word}, Score: ${score}`);
    },
    onError: (message) => {
      alert(message);
    },
  });

  return (
    <div className="bg-scrabble-beige p-4 rounded-md shadow-md max-w-[800px] mx-auto mb-6">
      <h2 className="text-xl font-bold text-center mb-4">Game Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="font-semibold">Scores</h3>
          <ul className="list-disc list-inside">
            {Object.entries(scores).map(([playerId, score]) => (
              <li key={playerId}>
                Player {playerId.slice(0, 4)}: {score}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Current Turn</h3>
          <p>{currentTurn ? `Player ${currentTurn.slice(0, 4)}` : 'Waiting...'}</p>
        </div>
        <div>
          <h3 className="font-semibold">Tiles Remaining</h3>
          <p>{tileBagCount} tiles left</p>
          <p>Your tiles: {playerTiles.length}</p>
        </div>
      </div>
    </div>
  );
};

export default GameStatus;