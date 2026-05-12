const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/sessions — list all sessions with event counts and last seen URL
router.get('/', async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: '$session_id',
          event_count: { $sum: 1 },
          first_seen: { $min: '$timestamp' },
          last_seen: { $max: '$timestamp' },
          pages_visited: { $addToSet: '$page_url' },
        },
      },
      { $sort: { last_seen: -1 } },
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

    res.json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sessions/:session_id — ordered event journey for a session
router.get('/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;

    const events = await Event.find({ session_id })
      .sort({ timestamp: 1 })
      .select('-__v')
      .lean();

    if (!events.length) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(events);
  } catch (err) {
    console.error('Error fetching session events:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
