import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import Head from 'next/head';
import PlayerList from '../../components/PlayerList';
import ScrabbleGame from '../../components/ScrabbleGame';
import '../../styles/scrabble.css';

const socket = io('https://acrophylia.onrender.com', {
  withCredentials: true,
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1000,
  timeout: 30000,
});

const GameRoom = () => {
  const router = useRouter();
  const { roomId: urlRoomId, creatorId } = router.query;
  const [roomId, setRoomId] = useState(urlRoomId || null);
  const [roomName, setRoomName] = useState('');
  const [roomNameSet, setRoomNameSet] = useState(false);
  const [isEditingRoomName, setIsEditingRoomName] = useState(false);
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState('waiting');
  const [isCreator, setIsCreator] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatListRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);

  // Chat scroll handling functions
  const checkIfNearBottom = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    isNearBottomRef.current = scrollBottom < 30;
  }, []);

  const scrollToBottomIfNeeded = useCallback(() => {
    if (isNearBottomRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCreator = sessionStorage.getItem('isCreator') === 'true';
      setIsCreator(storedCreator);
    }

    if (!urlRoomId || hasJoined) return;

    socket.on('connect', () => {
      setIsConnected(true);
      if (urlRoomId && !hasJoined) {
        socket.emit('joinRoom', { roomId: urlRoomId, creatorId });
      }
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('roomJoined', ({ roomId, isCreator: serverIsCreator, roomName }) => {
      setRoomId(roomId);
      setIsCreator(serverIsCreator);
      setRoomName(roomName);
      setRoomNameSet(!!roomName && roomName !== `Room ${roomId}`);
      sessionStorage.setItem('isCreator', serverIsCreator);
    });

    socket.on('roomNotFound', () => {
      alert('Room not found!');
      router.push('/');
    });

    socket.on('playerUpdate', ({ players, roomName }) => {
      setPlayers(players);
      setRoomName(roomName);
      setRoomNameSet(!!roomName && roomName !== `Room ${roomId}`);
      const currentPlayer = players.find(p => p.id === socket.id);
      if (currentPlayer && currentPlayer.name) setNameSet(true);
    });

    socket.on('creatorUpdate', (newCreatorId) => {
      setIsCreator(socket.id === newCreatorId);
      sessionStorage.setItem('isCreator', socket.id === newCreatorId);
    });

    socket.on('gameStarted', () => {
      setGameStarted(true);
      setGameState('playing');
    });

    socket.on('chatMessage', ({ senderId, senderName, message }) => {
      setChatMessages(prev => [...prev, { senderId, senderName, message }]);
    });

    socket.emit('joinRoom', { roomId: urlRoomId, creatorId });
    setHasJoined(true);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomJoined');
      socket.off('roomNotFound');
      socket.off('playerUpdate');
      socket.off('creatorUpdate');
      socket.off('gameStarted');
      socket.off('chatMessage');
    };
  }, [urlRoomId, router, creatorId]);

  useEffect(() => {
    scrollToBottomIfNeeded();
  }, [chatMessages, scrollToBottomIfNeeded]);

  const startGame = useCallback(() => {
    if (roomId && isCreator && !isStarting) {
      setIsStarting(true);
      socket.emit('startGame', roomId);
      setTimeout(() => setIsStarting(false), 1000);
    }
  }, [roomId, isCreator, isStarting]);

  const setRoomNameHandler = () => {
    if (roomName.trim() && roomId && isCreator && !roomNameSet) {
      socket.emit('setRoomName', { roomId, roomName });
      setRoomNameSet(true);
      setIsEditingRoomName(false);
    }
  };

  const setName = () => {
    if (playerName.trim() && roomId) {
      socket.emit('setName', { roomId, name: playerName });
      setNameSet(true);
      setPlayerName('');
    }
  };

  const sendChatMessage = () => {
    if (chatInput.trim() && roomId) {
      socket.emit('sendMessage', { roomId, message: chatInput });
      setChatInput('');
    }
  };

  const leaveRoom = () => {
    if (roomId) {
      socket.emit('leaveRoom', roomId);
      setRoomId(null);
      setRoomName('');
      setRoomNameSet(false);
      setPlayers([]);
      setGameState('waiting');
      setGameStarted(false);
      setHasJoined(false);
      sessionStorage.clear();
      router.push('/');
    }
  };

  const inviteLink = roomId ? `${window.location.origin}/room/${roomId}` : '';

  return (
    <>
      <Head>
        <title>{`Scrabble - Room ${roomId || ''}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="game-room-container">
        {roomId ? (
          <>
            <header className="header">
              <div className="room-title-container">
                {isEditingRoomName && isCreator && !roomNameSet && gameState === 'waiting' ? (
                  <div className="room-name-edit">
                    <input
                      className="input"
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter room name"
                      maxLength={20}
                      onKeyPress={(e) => e.key === 'Enter' && setRoomNameHandler()}
                    />
                    <button className="button" onClick={setRoomNameHandler}>
                      Save
                    </button>
                    <button
                      className="button"
                      onClick={() => setIsEditingRoomName(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h2 className="title">
                    {roomName || `Room ${roomId}`}
                    {isCreator && !roomNameSet && gameState === 'waiting' && (
                      <button
                        onClick={() => setIsEditingRoomName(true)}
                        aria-label="Edit Room Name"
                      >
                        ✏️
                      </button>
                    )}
                  </h2>
                )}
              </div>
              <div className="status-container">
                {!isConnected && (
                  <div className="reconnecting-badge">
                    <span className="reconnecting-text">RECONNECTING</span>
                    <span className="reconnecting-dots">...</span>
                  </div>
                )}
                <div className={`game-status-badge bg-${gameState}`}>
                  <span className="game-status-text">
                    {gameState.toUpperCase()}
                  </span>
                </div>
              </div>
            </header>

            {!gameStarted && (
              <div className="invite-container">
                <div className="invite-header">
                  <h3 className="invite-title">INVITE FRIENDS</h3>
                </div>
                <div className="invite-content">
                  <input className="invite-input" type="text" value={inviteLink} readOnly />
                  <button
                    className="button"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      const btn = event.target;
                      const originalText = btn.textContent;
                      btn.textContent = 'COPIED';
                      btn.disabled = true;
                      setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                      }, 3000);
                    }}
                  >
                    COPY LINK
                  </button>
                </div>
              </div>
            )}

            {!nameSet && gameState === 'waiting' && (
              <div className="container">
                <div className="game-section">
                  <div className="name-set-form">
                    <input
                      className="main-input"
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={20}
                      onKeyPress={(e) => e.key === 'Enter' && playerName.trim() && setName()}
                    />
                    <button
                      className="button"
                      onClick={setName}
                      disabled={!playerName.trim()}
                    >
                      Set Name
                    </button>
                  </div>
                  <div className="info-box">
                    Enter a name to join the game. You'll be able to play once the room creator starts the game.
                  </div>
                </div>
              </div>
            )}

            {gameState === 'waiting' && nameSet && (
              <div className="container">
                <div className="game-section">
                  <div className="waiting-header">
                    <h3 className="waiting-title">WAITING FOR PLAYERS</h3>
                  </div>
                  <div className="waiting-info">
                    <div className="info-box">
                      Game starts with 2-4 players.
                    </div>
                    <div className="player-count">
                      <span className="player-count-label">PLAYERS:</span>
                      <span className="player-count-value">{players.length}/4</span>
                    </div>
                  </div>
                  {isCreator ? (
                    <button
                      className={`button ${players.length >= 2 && !isStarting ? 'pulse-animation' : ''} ${isStarting ? 'opacity-70' : ''}`}
                      onClick={startGame}
                      disabled={isStarting || players.length < 2}
                    >
                      {isStarting ? 'STARTING...' : 'START GAME'}
                    </button>
                  ) : (
                    <div className="creator-note">
                      <div className="creator-icon">👑</div>
                      <div className="creator-text">
                        Waiting for the room creator to start the game...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {gameStarted && (
              <ScrabbleGame
                roomId={roomId}
                players={players}
                isCreator={isCreator}
                socket={socket}
              />
            )}

            <PlayerList players={players} leaveRoom={leaveRoom} />

            <div className="container">
              <h3 className="section-header">GAME CHAT</h3>
              <div 
                className="chat-list-wrapper" 
                ref={chatContainerRef}
                onScroll={checkIfNearBottom}
              >
                <ul className="chat-list" ref={chatListRef}>
                  {chatMessages.map((msg, index) => (
                    <li
                      key={index}
                      className={`chat-item ${msg.senderId === socket.id ? 'own-message' : ''}`}
                    >
                      <div className="pill chat-pill">
                        {msg.senderName}
                      </div>
                      <div className="chat-message">{msg.message}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="chat-input-container">
                <input
                  className="main-input chat-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={100}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <button className="button" onClick={sendChatMessage}>
                  SEND
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="loading-message">Loading room...</p>
        )}
      </div>
    </>
  );
};

export default GameRoom;