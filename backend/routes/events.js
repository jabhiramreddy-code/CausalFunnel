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

    res.status(201).json({ success: true, event_id: event._id });
  } catch (err) {
    console.error('Error storing event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
