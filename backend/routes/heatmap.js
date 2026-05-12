const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/heatmap?url=<page_url> — all click events for a given page
router.get('/', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Query param "url" is required' });
    }

    const clicks = await Event.find({
      event_type: 'click',
      page_url: url,
    })
      .select('x y timestamp session_id -_id')
      .lean();

    // Also return available page URLs so the frontend can populate the dropdown
    const availableUrls = await Event.distinct('page_url');

    res.json({ clicks, availableUrls });
  } catch (err) {
    console.error('Error fetching heatmap data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/heatmap/urls — all distinct page URLs that have events
router.get('/urls', async (req, res) => {
  try {
    const urls = await Event.distinct('page_url');
    res.json(urls);
  } catch (err) {
    console.error('Error fetching URLs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
