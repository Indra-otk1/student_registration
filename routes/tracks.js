const express = require('express');
const db = require('../db/connection');

const router = express.Router();

// GET /api/tracks — list all tracks
router.get('/', (req, res) => {
  const tracks = db.prepare('SELECT * FROM tracks').all();
  res.json(tracks);
});

// GET /api/tracks/:id/modules — list modules for a track, in order
router.get('/:id/modules', (req, res) => {
  const modules = db
    .prepare('SELECT * FROM training_modules WHERE track_id = ? ORDER BY order_index')
    .all(req.params.id);
  res.json(modules);
});

module.exports = router;
