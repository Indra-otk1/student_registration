# Registration & Training Platform

Student registration platform where users sign up, choose a test-prep track
(TOEFL, IELTS, Duolingo, SAT), and work through short training modules while
their progress is tracked.

## Setup

```bash
npm install
node db/seed.js      # creates the database and seeds tracks + modules
node server.js        # starts the server on http://localhost:3000
```

Then open http://localhost:3000 in your browser.

## Project structure

- `server.js` — Express app entry point
- `db/schema.sql` — database schema (users, tracks, training_modules, registrations, progress)
- `db/connection.js` — SQLite connection, applies schema on boot
- `db/seed.js` — seeds the 4 tracks and sample training modules
- `routes/tracks.js` — GET tracks, GET modules for a track
- `routes/registrations.js` — POST register, GET a registration
- `routes/progress.js` — GET a user's progress, POST to toggle module completion
- `public/` — frontend (registration form + training dashboard)

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/tracks | List all tracks |
| GET | /api/tracks/:id/modules | List modules for a track |
| POST | /api/register | Register a user for a track |
| GET | /api/register/:id | Get a registration's details |
| GET | /api/progress/:registrationId | Get module completion status |
| POST | /api/progress | Mark a module complete/incomplete |

## Notes

Uses SQLite (`better-sqlite3`) so there's no external database server to set
up — ideal for local development and demoing. Swapping to PostgreSQL later
just means replacing `db/connection.js` and adjusting the few `UUID`/`TEXT`
type differences in `db/schema.sql`.
