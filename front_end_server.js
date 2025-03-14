const express = require('express');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const  { Player, Game,Set } = require('./game'); 
const { createServer } = require('node:http');

const app = express();
const port = 3000;
const csvFilePath = path.join(__dirname, 'public', 'users.csv');
//socket
const server = createServer(app);
const io = new Server(server);

// settings 
var game;


app.use(express.static('public'));
app.use(express.json());

// Route for the homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/Public/admin.html');
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
    fs.readFile(csvFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Error reading file' });
        }
        const parsedData = parseCSV(data);
        res.json(parsedData);
    });
});
app.get('/start_game', (req, res) => {
    
    demo_game = new Game('demo_game')

});
// API: Add a new player
app.post('/players', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    fs.readFile(csvFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Error reading file' });
        }

        const players = parseCSV(data);

        // Check if the player already exists
        const existingPlayer = players.find(player => player.name.toLowerCase() === name.toLowerCase());
        if (existingPlayer) {
            return res.status(409).json({ error: 'Player with this name already exists' });
        }

        // Get the next available ID
        const nextId = players.length > 0 ? Math.max(...players.map(p => parseInt(p.id))) + 1 : 1;
        const newRow = [nextId, name, 1000];
        const csvRow = `\n${newRow.join(',')}`;

        // Append new player to the CSV file
        fs.appendFile(csvFilePath, csvRow, (err) => {
            if (err) {
                console.error('Error appending to file:', err);
                return res.status(500).json({ error: 'Error adding player' });
            }

            res.status(201).json({ id: nextId, name, chips: 1000 });
            console.log(`Player ${name} added with ID ${nextId}`);
        });
    });
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


