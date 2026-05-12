/**
 * api.js — Single source of truth for all backend API calls.
 * All pages and components import from here — no fetch() calls elsewhere.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
export const fetchSessionEvents = (sessionId) =>
  request(`/sessions/${encodeURIComponent(sessionId)}`);

/** Fetch all distinct page URLs that have events */
export const fetchPageUrls = () => request('/heatmap/urls');

/** Fetch click coordinates for a given page URL */
export const fetchHeatmap = (url) =>
  request(`/heatmap?url=${encodeURIComponent(url)}`);
