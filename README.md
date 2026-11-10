# Student Registration Platform

Students enter their details, upload a transcript, choose one or more tracks
(TOEFL, IELTS, SAT, Duolingo), and are then shown a YouTube overview video for
each track they chose.

## Run it

```bash
npm install
```

Then start the server with an admin password of your choice:

- Mac / Linux: `ADMIN_PASSWORD=choose-a-password node server.js`
- Windows (Command Prompt): `set ADMIN_PASSWORD=choose-a-password && node server.js`
- Windows (PowerShell): `$env:ADMIN_PASSWORD="choose-a-password"; node server.js`

Open http://localhost:3000 for the registration form.

## Where the student data is kept

- `data/registrations.json` — a file with every student's details
- `data/uploads/` — the uploaded transcripts (given random file names)

Back up the whole `data/` folder to keep the records safe.

## Viewing registrations

Go to http://localhost:3000/admin and sign in with username `admin` and the
password you set. You'll see a table of all registrations, with a link to
download each student's transcript. Without `ADMIN_PASSWORD` set, this page is
disabled.

## Adding your YouTube links

Edit the `TRACK_VIDEOS` list at the top of `public/videos.js`.

## Files

- `server.js` — receives the form, validates it, saves data and files, admin page
- `public/index.html`, `index.js` — registration form
- `public/videos.html`, `videos.js` — video page shown after registering
- `public/style.css` — styling

## Notes

- Transcripts are checked by their real content (PDF/JPG/PNG only, max 5 MB),
  not just the file name, and are never served publicly. Only the admin page
  can download them.
- Transcripts and contact details are personal data, so keep the `data/` folder
  private and use a strong admin password. If this goes on the internet, put it
  behind HTTPS.
