const express = require('express');
const crypto = require('crypto');
const db = require('../db/connection');

const router = express.Router();

// GET /api/progress/:registrationId — modules for the registration's track, with completion status
router.get('/:registrationId', (req, res) => {
  const registration = db
    .prepare('SELECT * FROM registrations WHERE id = ?')
    .get(req.params.registrationId);

  if (!registration) return res.status(404).json({ error: 'Registration not found' });

  const modules = db
    .prepare('SELECT * FROM training_modules WHERE track_id = ? ORDER BY order_index')
    .all(registration.track_id);

  const progressRows = db
    .prepare('SELECT * FROM progress WHERE registration_id = ?')
    .all(req.params.registrationId);

  const progressByModule = Object.fromEntries(progressRows.map((p) => [p.module_id, p]));

  const result = modules.map((m) => ({
    ...m,
    completed: !!progressByModule[m.id]?.completed,
    completed_at: progressByModule[m.id]?.completed_at || null,
  }));

  res.json(result);
});

// POST /api/progress — mark a module complete/incomplete for a registration
router.post('/', (req, res) => {
  const { registration_id, module_id, completed } = req.body;

  if (!registration_id || !module_id || typeof completed !== 'boolean') {
    return res
      .status(400)
      .json({ error: 'registration_id, module_id, and completed (boolean) are required' });
  }

  const existing = db
    .prepare('SELECT * FROM progress WHERE registration_id = ? AND module_id = ?')
    .get(registration_id, module_id);

  if (existing) {
    db.prepare('UPDATE progress SET completed = ?, completed_at = ? WHERE id = ?').run(
      completed ? 1 : 0,
      completed ? new Date().toISOString() : null,
      existing.id
    );
  } else {
    db.prepare(
      'INSERT INTO progress (id, registration_id, module_id, completed, completed_at) VALUES (?, ?, ?, ?, ?)'
    ).run(
      crypto.randomUUID(),
      registration_id,
      module_id,
      completed ? 1 : 0,
      completed ? new Date().toISOString() : null
    );
  }

  res.json({ ok: true });
});

module.exports = router;
