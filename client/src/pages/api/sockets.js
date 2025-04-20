// pages/api/socket.js
import { Server } from 'socket.io';

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log('Socket.IO server already running');
  } else {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('createRoom', ({ playerName }) => {
        const roomId = Math.random().toString(36).slice(2, 8);
        socket.join(roomId);
        socket.emit('roomCreated', { roomId });
      });

      socket.on('joinRoom', ({ roomId, playerName }) => {
        if (io.sockets.adapter.rooms.has(roomId)) {
          socket.join(roomId);
          socket.emit('roomJoined', { roomId });
        } else {
          socket.emit('error', 'Room does not exist');
        }
      });

      socket.on('placeTile', ({ roomId, row, col, tile, playerId }) => {
        io.to(roomId).emit('tilePlaced', { row, col, tile });
      });

      socket.on('submitWord', async ({ roomId, word, score }) => {
        try {
          const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
          if (response.ok) {
            io.to(roomId).emit('wordSubmitted', { word, score });
          } else {
            socket.emit('error', 'Invalid word!');
          }
        } catch (error) {
          socket.emit('error', 'Error validating word.');
        }
      });

      socket.on('resetBoard', ({ roomId }) => {
        io.to(roomId).emit('gameStateUpdate', {
          board: Array(15).fill().map(() => Array(15).fill(null)),
          placedTiles: [],
        });
      });

      socket.on('shuffleTiles', ({ roomId }) => {
        // Server-side shuffle logic if needed
      });
    });
  }
  res.end();
}