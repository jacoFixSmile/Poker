const express = require('express');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const { createServer } = require('node:http');

const app = express();
const port = 3000;
const csvFilePath = path.join(__dirname, 'public', 'users.csv');
//socket
const server = createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

// Route for the homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
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


class Game{
    constructor() {
        this.players=[]
        this
      }
      addPlayer(player){
        this.players.push(player)
      }
      removePlayer(player){
        this.players.push(player)
      }
}
class set{
    constructor(players) {
        this.players=[]
        this.deck=  [
            [
                "ace_of_clubs.png", "2_of_clubs.png", "3_of_clubs.png", "4_of_clubs.png", "5_of_clubs.png",
                "6_of_clubs.png", "7_of_clubs.png", "8_of_clubs.png", "9_of_clubs.png", "10_of_clubs.png",
                "jack_of_clubs.png", "jack_of_clubs2.png", "queen_of_clubs.png", "queen_of_clubs2.png",
                "king_of_clubs.png", "king_of_clubs2.png"
            ],
            [
                "ace_of_diamonds.png", "2_of_diamonds.png", "3_of_diamonds.png", "4_of_diamonds.png", "5_of_diamonds.png",
                "6_of_diamonds.png", "7_of_diamonds.png", "8_of_diamonds.png", "9_of_diamonds.png", "10_of_diamonds.png",
                "jack_of_diamonds.png", "jack_of_diamonds2.png", "queen_of_diamonds.png", "queen_of_diamonds2.png",
                "king_of_diamonds.png", "king_of_diamonds2.png"
            ],
            [
                "ace_of_hearts.png", "2_of_hearts.png", "3_of_hearts.png", "4_of_hearts.png", "5_of_hearts.png",
                "6_of_hearts.png", "7_of_hearts.png", "8_of_hearts.png", "9_of_hearts.png", "10_of_hearts.png",
                "jack_of_hearts.png", "jack_of_hearts2.png", "queen_of_hearts.png", "queen_of_hearts2.png",
                "king_of_hearts.png", "king_of_hearts2.png"
            ],
            [
                "ace_of_spades.png", "ace_of_spades2.png", "2_of_spades.png", "3_of_spades.png", "4_of_spades.png",
                "5_of_spades.png", "6_of_spades.png", "7_of_spades.png", "8_of_spades.png", "9_of_spades.png",
                "10_of_spades.png", "jack_of_spades.png", "jack_of_spades2.png", "queen_of_spades.png", "queen_of_spades2.png",
                "king_of_spades.png", "king_of_spades2.png"
            ],
            [
                "black_joker.png", "red_joker.png"
            ]
        ]

  
      }
}
class Player{
    constructor(id,name,chips){
        this.id=id
        this.name=name
        this.chips=chips
    }
     
}