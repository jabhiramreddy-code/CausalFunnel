/**
 * api.js — Single source of truth for all backend API calls.
 * All pages and components import from here — no fetch() calls elsewhere.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Socket.IO server URL — derived from VITE_API_URL by stripping the /api path.
 * Falls back to localhost for local development (the Vite proxy handles REST but
 * NOT WebSockets, so we connect directly to the backend for sockets in dev too).
 */
export const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : 'http://localhost:4000';


async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Fetch all sessions with event counts */
export const fetchSessions = () => request('/sessions');

/** Fetch ordered event journey for a single session */
export const fetchSessionEvents = (sessionId, page = 1) =>
  request(`/sessions/${encodeURIComponent(sessionId)}?page=${page}&limit=20`);

/** Fetch all distinct page URLs that have events */
export const fetchPageUrls = () => request('/heatmap/urls');

/** Fetch click coordinates for a given page URL */
export const fetchHeatmap = (url) =>
  request(`/heatmap?url=${encodeURIComponent(url)}`);
