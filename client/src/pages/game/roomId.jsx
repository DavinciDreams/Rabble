// pages/game/[roomId].jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GameProvider } from '../../context/GameContext';
import ScrabbleBoard from '../../components/ScrabbleBoard';
import PlayerRack from '../../components/PlayerRack';
import GameControls from '../../components/GameControls';
import GameStatus from '../../components/GameStatus';
import { useSocket } from '../../hooks/useSocket';

const GameRoom = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const socket = useSocket();

  useEffect(() => {
    if (socket && roomId) {
      socket.emit('joinRoom', { roomId, playerName: 'Player' }); // Replace with dynamic name
      socket.on('error', (message) => {
        alert(message);
        router.push('/');
      });
      return () => {
        socket.off('error');
      };
    }
  }, [socket, roomId, router]);

  return (
    <GameProvider>
      <div className="container max-w-[800px] mx-auto py-6">
        <h1 className="text-2xl font-bold text-center mb-6">Rabble - Room {roomId}</h1>
        <GameStatus />
        <ScrabbleBoard />
        <PlayerRack />
        <GameControls />
      </div>
    </GameProvider>
  );
};

export default GameRoom;