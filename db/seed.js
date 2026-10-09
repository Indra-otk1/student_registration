const crypto = require('crypto');
const db = require('./connection');

const existing = db.prepare('SELECT COUNT(*) AS n FROM tracks').get();
if (existing.n > 0) {
  console.log('Tracks already seeded, skipping.');
  process.exit(0);
}

const tracks = [
  { name: 'TOEFL', description: 'Test of English as a Foreign Language preparation' },
  { name: 'IELTS', description: 'International English Language Testing System preparation' },
  { name: 'Duolingo', description: 'Duolingo English Test preparation' },
  { name: 'SAT', description: 'Scholastic Assessment Test preparation' },
];

const modules = {
  TOEFL: ['Reading strategies', 'Listening practice', 'Speaking fluency drills', 'Writing structure'],
  IELTS: ['Academic reading', 'Listening section walkthrough', 'Speaking part 1-3 practice', 'Task 2 essay writing'],
  Duolingo: ['Adaptive test format overview', 'Vocabulary building', 'Dictation and listening', 'Photo and writing tasks'],
  SAT: ['Reading comprehension', 'Grammar and writing', 'Math: no calculator section', 'Math: calculator section'],
};

const insertTrack = db.prepare('INSERT INTO tracks (id, name, description) VALUES (?, ?, ?)');
const insertModule = db.prepare(
  'INSERT INTO training_modules (id, track_id, title, duration_minutes, order_index) VALUES (?, ?, ?, ?, ?)'
);

const seed = db.transaction(() => {
  for (const track of tracks) {
    const trackId = crypto.randomUUID();
    insertTrack.run(trackId, track.name, track.description);

    modules[track.name].forEach((title, index) => {
      insertModule.run(crypto.randomUUID(), trackId, title, 30, index + 1);
    });
  }
});

seed();
console.log('Seeded tracks and training modules.');
