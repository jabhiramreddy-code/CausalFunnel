/**
 * CausalFunnel Tracking Script
 * Drop this script into any webpage to start tracking user events.
 *
 * Usage: <script src="tracker.js" data-api="https://your-api.onrender.com"></script>
 */
(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────
  const scriptTag = document.currentScript;
  const API_BASE =
    (scriptTag && scriptTag.getAttribute('data-api')) ||
    'http://localhost:4000';

  // ── Session ID ──────────────────────────────────────────────────────────
  const SESSION_KEY = 'cf_session_id';

  function getSessionId() {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'sess-' + Math.random().toString(36).slice(2) + Date.now();
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  }

  const SESSION_ID = getSessionId();

  // ── Send Event ──────────────────────────────────────────────────────────
  function sendEvent(payload) {
    const body = JSON.stringify({
      session_id: SESSION_ID,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      ...payload,
    });

    // fetch with keepalive:true survives page unload (same guarantee as sendBeacon)
    // credentials:'omit' avoids the Access-Control-Allow-Credentials requirement
    // that sendBeacon triggers by default (it sends cookies).
    fetch(API_BASE + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'omit',
    }).catch(function (err) {
      console.warn('[CausalFunnel] Failed to send event:', err);
    });
  }

  // ── page_view ────────────────────────────────────────────────────────────
  function trackPageView() {
    sendEvent({ event_type: 'page_view' });
  }

  // ── click ────────────────────────────────────────────────────────────────
  function trackClick(e) {
    sendEvent({
      event_type: 'click',
      x: e.clientX,
      y: e.clientY,
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }

  document.addEventListener('click', trackClick);

  console.log('[CausalFunnel] Tracker initialized. Session:', SESSION_ID);
})();
