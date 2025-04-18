import { createContext, useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const serverUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001'  // Local development server
      : 'https://acrophylia.onrender.com'  // Production server
    const newSocket = io(serverUrl, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      timeout: 30000,
    })
    setSocket(newSocket)
    
    newSocket.on('connect', () => console.log('Socket connected'))
    newSocket.on('connect_error', (err) => console.log('Socket connection error:', err))
    
    return () => newSocket.close()
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)