const express = require('express');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const  { Player, Game,Set } = require('./game'); 
const { createServer } = require('node:http');
const { DatabaseSync } = require('node:sqlite');
const app = express();
const port = 3000;
const csvFilePath = path.join(__dirname, 'public', 'users.csv');
//socket
const server = createServer(app);
const io = new Server(server);

// settings 
var game;
const database = new DatabaseSync('public/poker.db');

app.use(express.static('public'));
app.use(express.json());

// Route for the homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/Public/admin.html');
});
app.get('/lobby', (req, res) => {
    res.sendFile(__dirname + '/Public/lobby.html');
});
// Function to parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim();
            return obj;
        }, {});
    });
}

// API route to get all players
app.get('/players', (req, res) => {
    const query = database.prepare('SELECT * FROM users');
     res.json(query.all())

});
app.get('/start_game', (req, res) => {
    demo_game = new Game('demo_game')

});
// API: Add a new player
app.post('/players', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    // protection against sql insert needed
    const query = database.prepare(`SELECT * FROM users where name like '${name}'`); 
    if(query.all().length==0) {
        const insert = database.prepare('INSERT INTO users (name) VALUES (?)');
        insert.run(name);
        const result = database.prepare(`SELECT * FROM users where name like '${name}'`); 
        res.status(201).json(result.all());
    }else{

        return res.status(500).json({ error: 'Name is already in use' })
    }
    
});

function ensureCSVExists() {
  if (!fs.existsSync(csvFilePath)) {
      console.log('CSV file not found. Creating a new one...');
      const headers = 'id,name,chips';
      fs.writeFileSync(csvFilePath, headers, 'utf8');
  } else {
  }
}
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
// game logic with socket

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
  });

server.listen(3000, () => {
    ensureCSVExists()

  console.log('Server running on http://localhost:3000');
});


