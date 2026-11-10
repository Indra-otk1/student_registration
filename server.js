const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads'); // NOT served publicly
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---------- Storage (a JSON file, no database software needed) ----------
const DB_FILE = path.join(DATA_DIR, 'registrations.json');

function loadAll() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveAll(list) {
  // Write to a temp file first, then swap it in, so a crash can't corrupt the data.
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

// ---------- Upload handling ----------
const ALLOWED_TRACKS = ['TOEFL', 'IELTS', 'SAT', 'Duolingo'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Detect the real file type from its first bytes, not from its name.
function detectType(buf) {
  if (buf.slice(0, 4).toString('latin1') === '%PDF') return '.pdf';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return '.jpg';
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return '.png';
  return null;
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_SIZE, files: 1 } });

function backWithError(res, message) {
  res.redirect('/?error=' + encodeURIComponent(message));
}

// ---------- App ----------
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.post('/register', (req, res) => {
  upload.single('transcript')(req, res, (err) => {
    if (err) {
      return backWithError(res, err.code === 'LIMIT_FILE_SIZE' ? 'Transcript is too large (max 5 MB).' : 'Upload failed. Please try again.');
    }

    const clean = (v) => (typeof v === 'string' ? v.trim() : '');
    const fullName = clean(req.body.full_name);
    const email = clean(req.body.email);
    const phone = clean(req.body.phone);
    const school = clean(req.body.school);
    const tracks = [].concat(req.body.tracks || []).filter((t) => ALLOWED_TRACKS.includes(t));

    if (!fullName || !email || !phone) return backWithError(res, 'Please fill in your name, email and phone number.');
    if (fullName.length > 150 || email.length > 150 || phone.length > 30 || school.length > 150) {
      return backWithError(res, 'One of the fields is too long.');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return backWithError(res, 'Please enter a valid email address.');
    if (tracks.length === 0) return backWithError(res, 'Please choose at least one track.');
    if (!req.file) return backWithError(res, 'Please upload your transcript.');

    const ext = detectType(req.file.buffer);
    if (!ext) return backWithError(res, 'Transcript must be a PDF, JPG or PNG file.');

    // Random file name so nobody can guess or overwrite stored files.
    const storedName = crypto.randomUUID() + ext;
    fs.writeFileSync(path.join(UPLOAD_DIR, storedName), req.file.buffer);

    const list = loadAll();
    list.push({
      id: list.length ? Math.max(...list.map((r) => r.id)) + 1 : 1,
      full_name: fullName,
      email,
      phone,
      school,
      tracks: tracks.join(','),
      transcript_file: storedName,
      transcript_original: path.basename(req.file.originalname).slice(0, 200),
      created_at: new Date().toISOString(),
    });
    saveAll(list);

    res.redirect('/videos.html?name=' + encodeURIComponent(fullName) + '&tracks=' + encodeURIComponent(tracks.join(',')));
  });
});

// ---------- Admin (password protected) ----------
function requireAdmin(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res.status(503).send('Admin page is disabled. Start the server with ADMIN_PASSWORD set.');
  }
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const given = Buffer.from(Buffer.from(encoded, 'base64').toString().split(':').slice(1).join(':'));
    const expected = Buffer.from(ADMIN_PASSWORD);
    if (given.length === expected.length && crypto.timingSafeEqual(given, expected)) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Admin"').status(401).send('Authentication required.');
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

app.get('/admin', requireAdmin, (req, res) => {
  const rows = loadAll().reverse(); // newest first
  const body = rows
    .map(
      (r) => `<tr>
        <td>${r.id}</td><td>${esc(r.full_name)}</td><td>${esc(r.email)}</td><td>${esc(r.phone)}</td>
        <td>${esc(r.school)}</td><td>${esc(r.tracks.replace(/,/g, ', '))}</td>
        <td><a href="/admin/files/${r.id}">${esc(r.transcript_original)}</a></td>
        <td>${esc(r.created_at)}</td></tr>`
    )
    .join('');
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Registrations</title>
    <style>body{font-family:sans-serif;padding:1.5rem}table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #ccc;padding:.5rem;text-align:left;font-size:.9rem}th{background:#f0f2f5}</style></head>
    <body><h1>Registrations (${rows.length})</h1>
    <table><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>School</th><th>Tracks</th><th>Transcript</th><th>Registered (UTC)</th></tr>
    ${body}</table></body></html>`);
});

app.get('/admin/files/:id', requireAdmin, (req, res) => {
  const row = loadAll().find((r) => r.id === Number(req.params.id));
  if (!row) return res.status(404).send('Not found');
  res.download(path.join(UPLOAD_DIR, row.transcript_file), row.transcript_original);
});

app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
  if (!ADMIN_PASSWORD) console.log('Note: ADMIN_PASSWORD is not set, so the /admin page is disabled.');
});
