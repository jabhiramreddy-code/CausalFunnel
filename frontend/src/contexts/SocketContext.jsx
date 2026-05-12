/**
 * SocketContext.jsx
 * Creates ONE shared Socket.IO connection for the entire app.
 * All components subscribe through this context — no duplicate connections.
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/api';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create exactly ONE socket for the entire app lifetime
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected:', socket.id);
      setConnected(true);
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // ← empty deps: runs once on mount, cleans up on unmount

  return (
    <SocketContext.Provider value={{ socketRef, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * useSocket — subscribe to a socket event using the shared connection.
 * @param {string}   event     Socket.IO event name
 * @param {Function} callback  Called with the payload each time the event fires
 */
export function useSocket(event, callback) {
  const ctx = useContext(SocketContext);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const socket = ctx?.socketRef?.current;
    if (!socket) return;

    const handler = (payload) => callbackRef.current(payload);
    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [event, ctx]); // re-subscribe only if event name or context changes

  return { connected: ctx?.connected ?? false };
}
