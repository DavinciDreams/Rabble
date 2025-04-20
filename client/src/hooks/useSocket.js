// hooks/useSocket.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'https://rabble-l5gj.onrender.com';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
};