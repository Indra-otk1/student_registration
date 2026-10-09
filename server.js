const express = require('express');
const path = require('path');

require('./db/connection'); // ensures schema is created on boot

const tracksRouter = require('./routes/tracks');
const registrationsRouter = require('./routes/registrations');
const progressRouter = require('./routes/progress');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/tracks', tracksRouter);
app.use('/api/register', registrationsRouter);
app.use('/api/progress', progressRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Registration platform running at http://localhost:${PORT}`);
});
