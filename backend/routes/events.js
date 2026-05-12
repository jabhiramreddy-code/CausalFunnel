const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// POST /api/events — receive and store a tracking event
router.post('/', async (req, res) => {
  try {
    const { session_id, event_type, page_url, timestamp, x, y } = req.body;

    if (!session_id || !event_type || !page_url) {
      return res.status(400).json({
        error: 'Missing required fields: session_id, event_type, page_url',
      });
    }

    if (!['page_view', 'click'].includes(event_type)) {
      return res.status(400).json({ error: 'Invalid event_type' });
    }

    const event = await Event.create({
      session_id,
      event_type,
      page_url,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      x: event_type === 'click' ? x : null,
      y: event_type === 'click' ? y : null,
    });

    // ── Real-time push ───────────────────────────────────────────────────
    // Compute a quick session summary so the dashboard can update in-place
    const [sessionSummary] = await Event.aggregate([
      { $match: { session_id } },
      {
        $group: {
          _id: '$session_id',
          event_count: { $sum: 1 },
          first_seen:  { $min: '$timestamp' },
          last_seen:   { $max: '$timestamp' },
          pages_visited: { $addToSet: '$page_url' },
        },
      },
      {
        $project: {
          _id: 0,
          session_id: '$_id',
          event_count: 1,
          first_seen: 1,
          last_seen: 1,
          pages_visited: { $size: '$pages_visited' },
        },
      },
    ]);

    const io = req.app.locals.io;
    if (io) {
      io.emit('new_event', {
        event: {
          _id: event._id,
          session_id: event.session_id,
          event_type: event.event_type,
          page_url:   event.page_url,
          timestamp:  event.timestamp,
          x:          event.x,
          y:          event.y,
        },
        session: sessionSummary || null,
      });
    }
    // ─────────────────────────────────────────────────────────────────────

    res.status(201).json({ success: true, event_id: event._id });
  } catch (err) {
    console.error('Error storing event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
