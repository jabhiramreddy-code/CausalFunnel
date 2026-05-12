/**
 * useSocket.js
 * Manages a Socket.IO connection to the backend.
 * - Connects once on mount, cleans up on unmount.
 * - Exposes `connected` state and an `on(event, callback)` helper.
 */

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/api';

/**
 * @param {string}   event     Socket.IO event name to subscribe to.
 * @param {Function} callback  Called with the payload each time the event fires.
 */
export function useSocket(event, callback) {
  const [connected, setConnected] = useState(false);
  // Keep stable refs so we don't recreate the socket on every render
  const socketRef = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socket.on(event, (payload) => callbackRef.current(payload));

    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]); // only reconnect if event name changes (it won't)

  return { connected };
}
