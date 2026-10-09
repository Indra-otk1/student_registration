const express = require('express');
const crypto = require('crypto');
const db = require('../db/connection');

const router = express.Router();

// POST /api/register — create (or reuse) a user, then register them for a track
router.post('/', (req, res) => {
  const { full_name, email, phone, track_id } = req.body;

  if (!full_name || !email || !track_id) {
    return res.status(400).json({ error: 'full_name, email, and track_id are required' });
  }

  const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(track_id);
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }

  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    const userId = crypto.randomUUID();
    db.prepare('INSERT INTO users (id, full_name, email, phone) VALUES (?, ?, ?, ?)').run(
      userId,
      full_name,
      email,
      phone || null
    );
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  }

  const registrationId = crypto.randomUUID();
  db.prepare('INSERT INTO registrations (id, user_id, track_id) VALUES (?, ?, ?)').run(
    registrationId,
    user.id,
    track_id
  );

  const registration = db
    .prepare('SELECT * FROM registrations WHERE id = ?')
    .get(registrationId);

  res.status(201).json({ user, registration, track });
});

// GET /api/registrations/:id — fetch a single registration with user + track info
router.get('/:id', (req, res) => {
  const registration = db
    .prepare(
      `SELECT r.*, u.full_name, u.email, t.name AS track_name
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       JOIN tracks t ON t.id = r.track_id
       WHERE r.id = ?`
    )
    .get(req.params.id);

  if (!registration) return res.status(404).json({ error: 'Registration not found' });
  res.json(registration);
});

module.exports = router;
