const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));
// Route for the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


// DATABASE
const db = new sqlite3.Database('./public/poker.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});
/*
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      chips INTEGER DEFAULT 1000
    )
  `);
});
*/
app.use(express.json());
// API route to get all players
app.get('/players', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// API: Add a new player
app.post('/players', async (req, res) => {
  console.log('Incoming POST request:', req.body); // ✅ Log request body
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Name is required' });
  db.run('INSERT INTO users (name) VALUES (?)', [name], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID, name, chips: 1000 });
    }
  });

});