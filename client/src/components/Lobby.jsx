// components/Lobby.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '../hooks/useSocket';
import { useSocketEvents } from '../utils/socketEvents';

const Lobby = () => {
  const socket = useSocket();
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  useSocketEvents(socket, {
    onRoomCreated: ({ roomId }) => {
      router.push(`/game/${roomId}`);
    },
    onRoomJoined: ({ roomId }) => {
      router.push(`/game/${roomId}`);
    },
    onError: (message) => {
      setError(message);
    },
  });

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!socket) {
      setError('Not connected to server');
      return;
    }
    socket.emit('createRoom', { playerName });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomId.trim()) {
      setError('Please enter your name and room ID');
      return;
    }
    if (!socket) {
      setError('Not connected to server');
      return;
    }
    socket.emit('joinRoom', { roomId, playerName });
  };

  return (
    <div className="container max-w-[800px] mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">Rabble Lobby</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex flex-col gap-4 max-w-[400px] mx-auto">
        <input
          type="text"
          placeholder="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scrabble-brown"
        />
        <input
          type="text"
          placeholder="Room ID (to join)"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scrabble-brown"
        />
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCreateRoom}
            className="px-5 py-2.5 text-white bg-scrabble-brown rounded-md hover:bg-scrabble-brown-dark transition-colors duration-200"
          >
            Create Room
          </button>
          <button
            onClick={handleJoinRoom}
            className="px-5 py-2.5 text-white bg-scrabble-brown rounded-md hover:bg-scrabble-brown-dark transition-colors duration-200"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;