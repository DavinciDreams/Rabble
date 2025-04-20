# Rabble Game

A rousing multiplayer game built with Next.js and Socket.IO.

## Setup
1. `npm install`
2. Run server: `npm run server`
3. Run app: `npm run dev`

## Tech Stack
- Next.js
- Socket.IO
- React
- 
/scrabble-game
├── /components
│   ├── ScrabbleBoard.jsx          # Renders the 15x15 game board
│   ├── PlayerRack.jsx            # Displays player's tiles
│   ├── GameControls.jsx          # Buttons for game actions
│   ├── GameStatus.jsx            # Shows turn, scores, and players
│   ├── Lobby.jsx                 # UI for joining/creating game rooms
│   └── Tile.jsx                  # Reusable tile component
├── /context
│   └── GameContext.js            # React Context for game state
├── /hooks
│   └── useSocket.js              # Custom hook for Socket.IO connection
├── /pages
│   ├── _app.jsx                  # Custom App component for context and layout
│   ├── index.jsx                 # Home page with lobby
│   ├── game/[roomId].jsx         # Dynamic route for game room
│   └── api/socket.js             # Optional API route for Socket.IO setup
├── /public
│   ├── favicon.ico               # App favicon
│   └── /assets                   # Static assets (e.g., tile images)
├── /styles
│   └── globals.css               # Global Tailwind CSS styles
├── /utils
│   ├── constants.js              # Game constants (tile bag, board size)
│   └── socketEvents.js           # Socket.IO event names and handlers
├── package.json                  # Project dependencies
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── README.md                     # Project documentation