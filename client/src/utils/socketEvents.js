// utils/socketEvents.js
import { useEffect } from 'react';

export const useSocketEvents = (socket, handlers) => {
  useEffect(() => {
    if (!socket) return;

    const {
      onGameStateUpdate,
      onTilePlaced,
      onWordSubmitted,
      onError,
      onRoomCreated,
      onRoomJoined,
    } = handlers;

    if (onGameStateUpdate) socket.on('gameStateUpdate', onGameStateUpdate);
    if (onTilePlaced) socket.on('tilePlaced', onTilePlaced);
    if (onWordSubmitted) socket.on('wordSubmitted', onWordSubmitted);
    if (onError) socket.on('error', onError);
    if (onRoomCreated) socket.on('roomCreated', onRoomCreated);
    if (onRoomJoined) socket.on('roomJoined', onRoomJoined);

    return () => {
      if (onGameStateUpdate) socket.off('gameStateUpdate', onGameStateUpdate);
      if (onTilePlaced) socket.off('tilePlaced', onTilePlaced);
      if (onWordSubmitted) socket.off('wordSubmitted', onWordSubmitted);
      if (onError) socket.off('error', onError);
      if (onRoomCreated) socket.off('roomCreated', onRoomCreated);
      if (onRoomJoined) socket.off('roomJoined', onRoomJoined);
    };
  }, [socket, handlers]);
};